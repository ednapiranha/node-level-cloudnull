# level-cloudnull

Create your own cloud service that deletes files on the TTL of your choosing.

## Usage

    var Cloudnull = require('level-cloudnull');

    var c = new Cloudnull({
      fileDir: './files',
      dbPath: './db',
      ttl: 10000
    });

`ttl` is in milliseconds. `fileDir` and `dbPath` are defaulted at the above locations.

### Save a new file for a group

    c.save('user123', 'hello cloud', 'hello.txt', function (err, filename) {
      console.log(filename);
    });

Group would be a user or some form of identification for the collection of files. In this example, it is 'user123'.

### Get all files from a group

    c.getAll('user123', function (err, files) {
      console.log(files);
    });

## Tests

    npm test
