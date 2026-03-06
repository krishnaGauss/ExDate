FROM golang:1.25.7 as build
WORKDIR /app


COPY go.mod go.sum ./
RUN go mod download

COPY . .
# Build the binary targeting Amazon Linux (Lambda architecture)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o main main.go

# Stage 2: Create the final tiny container
FROM public.ecr.aws/lambda/provided:al2023
# Copy the compiled binary from the build stage
COPY --from=build /app/main /main
# Tell Lambda what file to run when a request comes in
ENTRYPOINT [ "/main" ]
