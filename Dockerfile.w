FROM jenkins/agent:latest

USER root
RUN apt-get update && apt-get install -y docker.io
USER jenkins
