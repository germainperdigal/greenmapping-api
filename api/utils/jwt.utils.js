// Imports
var jwt = require('jsonwebtoken');


module.exports = {
    generateToken: function(userData) {
        return jwt.sign({
                email: userData.email,
                userId: userData._id,
            },
            "B38TyQffbmCzEsyRc", {
                expiresIn: "2h"
            }
        );
    },
    generateAdminToken: function(userData) {
        return jwt.sign({
                pseudo: userData.pseudo,
            },
            "B38TyQffbmCzEsyRc", {
                expiresIn: "1h"
            }
        );
    },
    getUserId: function(authorization) {
        var userId = -1;
        if (authorization != undefined) {
            var token = authorization.split(" ")[1]
            if (token != null) {
                try {
                    var jwtToken = jwt.verify(token, "B38TyQffbmCzEsyRc");
                    if (jwtToken != null)
                        userId = jwtToken.userId;
                } catch (err) {
                    console.log(err);
                }
            } else
                console.log("token null")
        }
        return userId;
    }
}