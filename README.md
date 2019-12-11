# isup
A tool to test whether an external service is up.

## Usage
### Standalone
Simply run `node check.js` or `npm run check` and provide comma-separated FQDNs of the desired services as environment variables. If no services are provided, or at least one services is inaccessible, `isup` will log an error to the console and with a negative exit code.

Below is a list of all supported services and their environment variable names:

- PostgreSQL: `POSTGRES`
- Redis: `REDIS`
- Elasticsearch: `ELASTICSEARCH`
- InfluxDB: `INFLUXDB`
- RabbitMQ: `RABBITMQ`

You can also run `npm run watch` or `node watch` to wait until all checks pass with a specific time interval.

#### Examples
```bash
$ POSTGRES=postgres://postgres:postgres@localhost/foo node check
```

```bash
$ REDIS=redis://x:somepassword@172.16.1.44/0,redis://x:somepassword@172.16.1.44/1 node check
```

```bash
$ ELASTICSEARCH=http://localhost:9200 node watch
```

### Docker
Similar to the standalone mode, pass environment variables with the `-e` flag in the `docker run` command, or in the `env` key of your Docker compose service:

#### Examples
```bash
$ docker run --rm -e POSTGRES=postgres://postgres:postgres@host.docker.internal/foo ygunayer/isup
```

Note that the entrypoint of the Docker image is the `node check` command, so in order to run `isup` in watch mode you'll have to reset the entrypoint of the container and provide the full run command:

```bash
$ docker run --entrypoint="" --rm -e POSTGRES=postgres://postgres:postgres@host.docker.internal/foo ygunayer/isup node watch 2000
```

### Kubernetes
One of the primary use cases of `isup` is to have your Kubernetes containers wait until a certain service becomes available before being launched. This can be achieved by defining an instance of `isup` as an `initContainer` in your deployment.

See the following example:

*foo-deployment.yaml*
```yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: foo-app
spec:
  replicas: 2
  template:
    spec:
      initContainers:
        - name: foo-worker-init
          image: ygunayer/isup:latest
          command: ['node', 'watch', '2000']
          env:
            - name: "REDIS"
              value: "redis://172.16.0.100/0,redis://172.16.0.101/0"
            - name: "POSTGRES"
              valueFrom: 
                secretKeyRef:
                  name: my-secrets
                  key: postgres_url
      containers:
        - name: foo-worker
          image: some-company/foo:1.0.0
          env:
            - name: "REDIS"
              value: "redis://172.16.0.100/0,redis://172.16.0.101/0"
            - name: "PSQL_URL"
              valueFrom: 
                secretKeyRef:
                  name: my-secrets
                  key: postgres_url
...
```

## TODO
- Add more services
- Create a Helm chart

## LICENSE
MIT
