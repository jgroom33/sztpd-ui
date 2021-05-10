# sztpd-ui

## Dependencies

* [SZTPD server](https://watsen.net/docs/)

## Project development setup

1. Install dependencies
    ```bash
    yarn install
    ```
2. Change the IP address in [config](vue.config.js)
3. Run
    ```bash
    yarn serve
    ```

# Deployment

1. Install dependencies
    ```bash
    apt install npm
    apt install nginx
    npm install
    npm build
    cp -r dist /app
    cp nginx.conf /etc/nginx/nginx.conf
    systemctl restart nginx
    ```
