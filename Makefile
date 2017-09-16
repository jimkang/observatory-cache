include config.mk

SSHCMD = ssh $(SMUSER)@$(SERVER)
PRIVSSHCMD = ssh $(PRIVUSER)@$(SERVER)
PROJECTNAME = observatory-cache
APPDIR = /opt/$(PROJECTNAME)
CACHEDIR = /usr/share/nginx/html/observatory-cache

HOMEDIR = $(shell pwd)
CURRENTDATE = $(shell /bin/date +%Y-%m-%d)
STAMPED_FILENAME = $(CACHEDIR)/jimkang-cache-$(CURRENTDATE).json
FILENAME = $(CACHEDIR)/jimkang-cache.json

run:
	echo "$(PATH)"
	echo "$(CURRENTDATE)\n" 2>> cache-errors.log
	node get-observatory-cache.js > $(STAMPED_FILENAME) 2>> cache-errors.log
	/bin/cp $(STAMPED_FILENAME) $(FILENAME)

run-remote:
	$(SSHCMD) "cd /opt/$(PROJECTNAME) && make run"

check-cache-files:
	$(SSHCMD) "cd $(CACHEDIR) && find . -name '*.json' | xargs wc -l"
	$(SSHCMD) "cd $(CACHEDIR) && ls -l"

pushall:
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(SMUSER)@$(SERVER):/opt/ \
		--exclude node_modules/ \
		--exclude api-deed-stream \
		--omit-dir-times --no-perms
	$(SSHCMD) "cd /opt/$(PROJECTNAME) && npm install"
	$(SSHCMD) "mkdir -p $(CACHEDIR)"

set-up-remote-directories:
	$(SSHCMD) "mkdir -p $(APPDIR)"

check-errors:
	$(SSHCMD) "tail $(APPDIR)/cache-errors.log"
