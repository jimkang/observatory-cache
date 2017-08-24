include config.mk

SSHCMD = ssh $(SMUSER)@$(SERVER)
PRIVSSHCMD = ssh $(PRIVUSER)@$(SERVER)
PROJECTNAME = observatory-cache
APPDIR = /opt/$(PROJECTNAME)

HOMEDIR = $(shell pwd)

run:
	node get-observatory-cache.js

pushall:
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(SMUSER)@$(SERVER):/opt/ \
		--exclude node_modules/ \
		--exclude api-deed-stream \
		--omit-dir-times --no-perms
	$(SSHCMD) "cd /opt/$(PROJECTNAME) && npm install"

set-up-remote-directories:
	$(SSHCMD) "mkdir -p $(APPDIR)"
