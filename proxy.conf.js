module.exports = {
    "/socket/*": {
        "target": "http://localhost:8080/socket",
        "ws": true,
        "logLevel": "debug"
    }
}