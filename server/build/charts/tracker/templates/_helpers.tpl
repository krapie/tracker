{{/*
Expand the name of the chart.
*/}}
{{- define "tracker.name" -}}
{{- default .Chart.Name .Values.tracker.name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "tracker.fullname" -}}
{{- $name := default .Chart.Name .Values.tracker.name }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "tracker.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels for tracker
*/}}
{{- define "tracker.labels" -}}
helm.sh/chart: {{ include "tracker.chart" . }}
{{ include "tracker.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: {{ include "tracker.name" . }}
app.kubernetes.io/component: server
{{- end }}

{{/*
Selector labels for tracker
*/}}
{{- define "tracker.selectorLabels" -}}
app: {{ include "tracker.name" . }}
app.kubernetes.io/name: {{ include "tracker.name" . }}
app.kubernetes.io/instance: {{ include "tracker.name" . }}
{{- end }}
