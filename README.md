# npm-multi-linker

This utility is made to simplify the handling of multiple dependant npm modules. It allows you to link multiple dependencies of multiple modules with one simple command.

Determination on what to link is based on which modules are currently installed in the target module and which modules are found in the source modules. Be sure to `npm install` your dependencies before trying to link. Use the `-i`-option to install before linking.

## Options

| Option | Long Option       | Description                                              |
| :----- | :---------------- | :------------------------------------------------------- |
| -d     | --dry-run         | Only print the results.                                  |
| -i     | --install-before  | Run npm install in each package before linking.          |
| -n     | --npm-link        | Use npm link istead of directly creating symlinks.       |
| -p     | --package-path    | Package(s) on which dependencies shall be replaced.      |
| -q     | --quiet           | No stdout output.                                        |
| -r     | --recursion-depth | How deep to search for modules in search paths. if only -r is specified, it searches infinitly (may be slow) |
| -s     | --search-path     | These paths are searched for target modules for links.   |
| -u     | --unlink          | Reset all links by invoking npm install in all packages. |

## Examples

### Replace all dependencies of all modules in the current by links to modules in current directory

```
cd path/to/directory/containing/my/repos
npm-multi-linker
```

### Replace all dependencies of a given module in the current directory by links to modules in current directory

```
cd path/to/directory/containing/my/repos
npm-multi-linker -p my-package
```

### Replace all dependencies of a given module in directory dir1 by links to modules in directory dir2

```
npm-multi-linker -p path/to/dir1/my-module -s path/to/dir2
```

### Run npm install before linking

This is handy when you just cloned your repositories but did not install.

```
cd path/to/directory/containing/my/repos
npm-multi-linker -i
```

### Undo linking

Side use: This can also be used if you never linked before. It just runs `npm install` in all packages.

```
cd path/to/directory/containing/my/repos
npm-multi-linker -u
```
