package storage

import (
	"context"
	"io"
)

type Storage interface {
	Upload(ctx context.Context, objectName string, reader io.Reader, size int64, contentType string) (string, error)
	GetURL(ctx context.Context, objectName string) (string, error)
	Delete(ctx context.Context, objectName string) error
}
