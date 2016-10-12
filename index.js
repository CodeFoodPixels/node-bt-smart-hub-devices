'use strict';

const request = require('request-promise');
const hex_md5 = require('md5-hex');

module.exports = {
    getList: (routerIP) => {
        const authCookieObj = {
                req_id: 1,
                sess_id: 0,
                basic: false,
                user: `guest`,
                dataModel: {
                    name: `Internal`,
                    nss: [
                        {
                            name: `gtw`,
                            uri: `http://sagemcom.com/gateway-data`
                        }
                    ]
                },
                ha1: `ca6e4940afd41d8cd98f00b204e9800998ecf8427e830e7a046fd8d92ecec8e4`,
                nonce: ``
            };

        const authRequestObj = {
                request: {
                    id: 0,
                    'session-id': 0,
                    priority: true,
                    actions: [
                        {
                            id: 0,
                            method: `logIn`,
                            parameters: {
                                user: `guest`,
                                persistent: true,
                                'session-options': {
                                    nss: [
                                        {
                                            name: `gtw`,
                                            uri: `http://sagemcom.com/gateway-data`
                                        }
                                    ],
                                    language: `ident`,
                                    'context-flags': {
                                        'get-content-name': true,
                                        'local-time': true
                                    },
                                    'capability-depth': 2,
                                    'capability-flags': {
                                        name: true,
                                        'default-value': false,
                                        restriction: true,
                                        description: false
                                    },
                                    'time-format': `ISO_8601`
                                }
                            }
                        }
                    ],
                    cnonce: 745670196,
                    'auth-key': `06a19e589dc848a89675748aa2d509b3`
                }
            };

        return request({
            method: `POST`,
            url:`http://${routerIP}/cgi/json-req`,
            headers: {
                Cookie: `lang=en; session=${encodeURIComponent(JSON.stringify(authCookieObj))}`,
            },
            form: `req=${encodeURIComponent(JSON.stringify(authRequestObj))}`
        }).then((body) => {
            body = JSON.parse(body);

            const clientNonce = Math.floor(4294967295 * (Math.random() % 1));
            const requestId = 1;
            const serverNonce = body.reply.actions[0].callbacks[0].parameters.nonce;
            const user = `guest`;
            const pass = `d41d8cd98f00b204e9800998ecf8427e`; // MD5 of an empty string

            const authHash = hex_md5(user + ":" + serverNonce + ":" + pass);
            const authKey = hex_md5(authHash + ":" + requestId + ":" + clientNonce + ":JSON:/cgi/json-req");

            const listCookieObj = {
                    req_id: requestId,
                    sess_id: body.reply.actions[0].callbacks[0].parameters.id,
                    basic: false,
                    user: `guest`,
                    dataModel: {
                        name: `Internal`,
                        nss: [
                            {
                                name: `gtw`,
                                uri: `http://sagemcom.com/gateway-data`
                            }
                        ]
                    },
                    ha1: `2d9a6f39b6d41d8cd98f00b204e9800998ecf8427eba8d73fbd3de28879da7dd`,
                    nonce: body.reply.actions[0].callbacks[0].parameters.nonce
                };

            const listReqObj = {
                    request: {
                        id: requestId,
                        'session-id': body.reply.actions[0].callbacks[0].parameters.id,
                        priority: false,
                        actions: [
                            {
                                id: 1,
                                method: `getValue`,
                                xpath: `Device/Hosts/Hosts`,
                                options: {
                                    'capability-flags': {
                                        interface: true
                                    }
                                }
                            }
                        ],
                        cnonce: clientNonce,
                        'auth-key': authKey
                    }
                };

            return request({
                method: `POST`,
                url:`http://${routerIP}/cgi/json-req`,
                headers: {
                    Cookie: `lang=en; session=${encodeURIComponent(JSON.stringify(listCookieObj))}`,
                },
                form: `req=${encodeURIComponent(JSON.stringify(listReqObj))}`
            });

        }).then((body) => {
            body = JSON.parse(body);

            return body.reply.actions[0].callbacks[0].parameters.value.filter((item) => {
                return item.Active && item.HostName.length > 0;
            }).map((item) => {
                return item.HostName;
            });
        });
    }
};
