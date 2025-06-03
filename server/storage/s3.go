package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

type S3Storage struct {
	Client     *s3.S3
	BucketName string
	Region     string
}

func NewS3Storage() (*S3Storage, error) {
	region := os.Getenv("AWS_REGION")
	bucket := os.Getenv("AWS_S3_BUCKET")
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")

	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(region),
		Credentials: credentials.NewStaticCredentials(accessKey, secretKey, ""),
	})
	if err != nil {
		return nil, err
	}

	client := s3.New(sess)
	return &S3Storage{
		Client:     client,
		BucketName: bucket,
		Region:     region,
	}, nil
}

func (s *S3Storage) Upload(ctx context.Context, objectName string, reader io.Reader, size int64, contentType string) (string, error) {
	// Read the content into a buffer that implements io.ReadSeeker
	buf := make([]byte, size)
	_, err := io.ReadFull(reader, buf)
	if err != nil {
		return "", err
	}
	readSeeker := aws.ReadSeekCloser(bytes.NewReader(buf))

	_, err = s.Client.PutObjectWithContext(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.BucketName),
		Key:         aws.String(objectName),
		Body:        readSeeker,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", err
	}
	return s.GetURL(ctx, objectName)
}

func (s *S3Storage) GetURL(ctx context.Context, objectName string) (string, error) {
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.BucketName, s.Region, objectName), nil
}

func (s *S3Storage) Delete(ctx context.Context, objectName string) error {
	_, err := s.Client.DeleteObjectWithContext(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(objectName),
	})
	return err
}
