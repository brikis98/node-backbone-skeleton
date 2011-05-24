ROOT_DIR ?= $(realpath .)
SRC_DIR=src
BUILD_DIR=$(ROOT_DIR)

# compute coffee dependencies
COFFEE := $(shell find $(SRC_DIR) -name '*.coffee')
GEN_JS = $(COFFEE:$(SRC_DIR)/%.coffee=$(BUILD_DIR)/%.js)

.PHONY: all clean

all: generate 

generate: $(GEN_JS)

test: generate
	@expresso test/settings.test.js

clean:
	@rm -f $(GEN_JS)

$(BUILD_DIR)/%.js: $(SRC_DIR)/%.coffee
	@mkdir -p $(dir $@)
	@cat res/GENERATED_JS_HEADER > $@
	@echo // Original file: $< >> $@
	@coffee -b -p -c $< >> $@

# vim: noexpandtab ts=4 :
