# Change Log

All notable changes to the "avro-tools" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]
- Run json validation before building syntax tree to highlight more errors


## [0.0.1] - 2020-09-03
### Added
- Syntax highlighting
- Auto formatting
- Snippets for adding new fields
- Validation:
	* file is in JSON format
	* union default value is matching first type
	* attributes have correct types
	* attributes are not duplicated
	* types have all required attributes
	* logical types are matching type and have all attributes set correctly
	* names, namespaces and enum symbols are in correct format
