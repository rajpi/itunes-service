# Itunes custom wrapper search service

This application serves as wrapper service to https://itunes.apple.com/search?term=<search term>

Response body pattern

```bash
{ 'song' : [{
        id: Integer, // trackId (ID of
        entity)
        name: String, // name of entity
        artwork: String, // URL of the
        artwork
        genre: String, // Genre of entity
        url: String // trackViewUrl
    },
    ...
    ]
,
'feature-movie': [{
        id: Integer, // trackId (ID of
        entity)
        name: String, // name of entity
        artwork: String, // URL of the
        artwork
        genre: String, // Genre of entity
        url: String // trackViewUrl
    },
    ...
    ]
}
```
