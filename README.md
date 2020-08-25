# avro-tools

This is an extension to validate Avro schema in `.avsc` files. It does schema highlighting using TextMate engine. Autocomplete is not implemented.

It is not yet released as it doesn't have stable functionality.

## Features

Currently it does syntax highlighting. Validation only picks invalid JSON tokens.

## Requirements

It requires VS Code in version at least 1.48.0

## Extension Settings

This extension doesn't use settings. The code touching settings is left over from extension used as base.

## Known Issues

Parser doesn't handle floats, true and false. (Done)

Syntax tree only understands root node with fields. Field values must be primitives or array.

* Nesting nodes inside nodes is not supported (Done, at least optimistic scenario)
* Nesting nodes inside array is not supported (Done, at least optimistic scenario)
* Nesting array inside array is not supported (Done, at least optimistic scenario)
* Bool, float, int and null may not be added as value in node (Done)
* After matching last closing bracket all text is ignored (Done)
* Tolerance to invalid syntax is very low

## Planned Features

* Implementing functionality from Known Issues
* Validating default values
* Validate text separators ("}", "]", ":", "," but syntax tree building is causing entire document to go read on missing closing bracket when attribute had value, that could be added)
* Validating keys available in Avro (Based on documentation other keys are correct " Attributes not defined in this document are permitted as metadata, but must not affect the format of serialized data. ")
* Validating keys inside a node based on type (Done, at least what I found in a documentation)
* Validating names
* Validating enum values
* Validating values in array
* Highlighting duplicated keys / fields (Done for duplicated attributes)
* Autocomplete of keys, types, defaults
* Autocomplete of snippets

## Release Notes

No releases yet