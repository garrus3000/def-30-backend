# Clase 30 - Desafio: PROXY y NGINX

## Consigna 1
1 - En la vista de ruta "/info", agregado número de procesadores presentes en el servidor y puerto en escucha

2 - Ejecutar el servidor en modo FORK o CLUSTER

3 - Parámetros: 

* ``-p PUERTO o PORT=<PORT>``
    * Ej: ``-p 3000``
        <br>De no pasar dicho parámetro el Puerto por defecto es: ``8080``
        <br>
    * Ej: `` PORT=8081 ``
        <br> De no pasar dicho parámetro el Puerto por defecto es: ``8080``

<br>

* ``-m MODO o MODO=<MODO>``
    * Ej: ``-m FORK``
        <br> De no pasar dicho parámetro el Modo por defecto es: ``FORK``
        <br>
    * Ej: `` MODO=CLUSTER ``
        <br> De no pasar dicho parámetro el Modo por defecto es: ``FORK``

## Opcines:
1 - Iniciar por comando ``node``

> node server.js

> npm start

## Ejemplos
``node server.js``
````
node server.js -p 3000 -m CLUSTER
````

````
PORT=3000 MODO=CLUSTER node server.js
````

``npm start``
````
npm start -- -p 8081 -m CLUSTER
````

````
PORT=8081 MODO=CLUSTER npm start
````

2 - Iniciar por comando ``nodemon``

> nodemon server.js

> npm run watch

## Ejemplos
``nodemon server.js``
````
nodemon server.js -- -p 3000 -m CLUSTER
````

``npm run watch``
````
PORT=8081 MODO=CLUSTER npm run watch
````
<br>

3 - Iniciar por comando ``forever``
> forever start server.js

### Comandos
* forever start server.js --watch
    * ``Ejecuctar servidor por forever en modo watch``
* forever list
    * ``Verificar procesos primarios iniciados por forever``
* Listar procesos por sistema operativo
    * ``Ver PROCESOS y PUERTOS``
* forever stopall
    * ``Detener todos los procesos ejecutados por forever``
* forever stop PID
    * ``Detener proceso específico por forever``


## Ejemplos

``forever server.js --watch``


````
PORT=8081 MODO=CLUSTER forever start server.js --watch
````
````
PORT=3000 forever start server.js --watch
````
````
forever list
````
Ver `` PROCESOS y PUERTOS `` de ser necesario

````
forever stopall
````
````
forever list
````
<br>

4 - Iniciar por comando ``pm2``

> pm2 start server.js

### Comandos
* pm2 start server.js --watch
    * ``Ejecuctar servidor por pm2 en modo watch``
* pm2 list
    * ``Verificar procesos iniciados por pm2``
* pm2 monit
    * ``Monitor de procesos iniciados por pm2``
* Listar procesos por sistema operativo
    * ``Ver PROCESOS y PUERTOS``
* pm2 restart  < "app_name" | namespace | id | 'all'| json_conf>
    * ``Reiniciar procesos por pm2 ``
* pm2 reload < "app_name" | namespace | id | 'all' | json_conf>
    * ``Permite actualizar una aplicación sin ningún tiempo de inactividad``
* pm2 stop  < "app_name" | namespace | id | 'all' | json_conf>
    * ``Detener procesos ejecutados por pm2``
* pm2 delete   < "app_name" | namespace | id | 'all' | json_conf>
    * ``Borrar servidores de pm2``
* pm2 log < "app_name" | namespace | id | 'all' | json_conf>
    * ``Ver logs de pm2 ``
* pm2 flush < "app_name" | namespace | id | 'all' | json_conf>
    * ``Borrar logs de pm2 ``

## Ejemplos
`` pm2 server.js --watch``

````
pm2 start server.js --name="Serv1" --watch -- -p 8081
````
````
PORT=8082 pm2 start server.js --name="Serv2Cluster" -i max --watch
````
````
pm2 list
````
````
pm2 log
````
Ver `` PROCESOS y PUERTOS `` de ser necesario

````
pm2 stop all
````
````
pm2 delete all
````
````
pm2 flush
````
<br>

--------
### PROCESOS y PUERTOS
``Listar procesos iniciados y ver puertos``
* Listar procesos por ``sistema operativo``
    * Windows: 
        ````
        tasklist /fi "imagename eq node.exe"
        ````
        ````
        netstat -a -o
        ````
        ````
        netstat -aof | findstr :<PUERTO>
        ````
        ``Kill PID``
    
        ````
        taskkill /pid <PID>
        ````
    <br>
    <br>

    * Linux: 
        ````
        ps
        ````
        ````
        ps aux
        ````
        ````
        ps -axjf
        ````

      ``Kill PID``
    
        ````
        kill -9 <PID>
        ````
-----

## Consigna 2
### PARTE 1

 ``Configurar Nginx para balancear las cargar del servidor``
*  1 - Inicar servidor modo FORK en puerto 8080
*  2 - Iniciar servidor modo CLUSTER en puerto 8081
*  3 - Redirigir todas la consultas de "/api/randmons" al servidor en modo CLUSTER
*  4 - El resto de las consultas son redirigidas al servidor en modo FORK

## Ejemplo
1) Ejecutar servidor modo FORK
````
pm2 start server.js --name="FORK" --watch
````
2) Ejecutar servidor modo CLUSTER
````
PORT=8081 pm2 start server.js --name="CLUSTER" -i max --watch
````
3) Configurar Nginx para redirigir todas la consultas de "/api/randmons" al servidor en modo CLUSTER:
    *   Usando el puerto 80.   

````
    events {
}


http {
    include       mime.types;
    default_type  application/octet-stream;

     upstream app_random {
        server 127.0.0.1:8081;
    }

    upstream app_node_info {
        server 127.0.0.1:8080;
        server 127.0.0.1:8081 weight=2;
    }



    server {
        listen       80;
        server_name  localhost;

        location / {
            proxy_pass http://127.0.0.1:8080;
        }

        # CONFIGURACION 1 NGINX

        location /api/randoms/ {
            proxy_pass http://app_random;
        }
        # --------------------------------------------------------------


        # Verificacion de balanceador de carga ruta "/info"

        location /info/ {
            proxy_pass http://app_node_info;
        }
        # --------------------------------------------------------------

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
````

4) Ejecutar ``nginx.exe`` dentro de la carpeta carpeta nginx-1.23.1
    *   Ingresar a http://localhost:8080/info
    *   Ingresar a http://localhost:8081/info
    
    <br>

    *   Ingresar a http://localhost:80/api/randoms
    *   Ingresar a http://localhost:80/info para comprobar cambio de puerto por balanceador de carga

    <br>


5) Finalizar los procesos de ``ngninx.exe``
    * Ver `` PROCESOS y PUERTOS `` o desde el ``Administrador de tareas`` del sistema operativo

    <br>

6) Detener y borrar los servidores iniciados

    ````
    pm2 delete all
    ````
7) Borrar todos los logs de

    ````
    pm2 flush
    ````

<br>

### PARTE 2 

``Configurar Nginx para que todas las consultas sean redirigidas a un CLUSTER de servidores gestionado por NGINX ``

``Repartiendolas equitativamente en 4 instancias escuchando en los puertos: 8082, 8083, 8084, 8085``

*  1 - Inicar servidor modo FORK en puerto 8080
*  2 - Iniciar servidores modo FORK/CLUSTER en puerto 8082, 8083, 8084, 8085
*  3 - Configurar NGINX para redirigir todas la consultas de "/api/randmons" a servidores en modo FORK/CLUSTER
*  4 - El resto de las consultas son redirigidas al servidor en modo FORK


## Ejemplo
1) Usar el punto ``1.`` del Ejemplo anterior ``PARTE 1``

2) Usar el punto ``2.`` del Ejemplo anterior ``PARTE 1``
    *   Cambiando los parámetros de: nombre por ``pm2``, modo por ``pm2`` y puerto segun corresponda

    <br>
    
    ### Ej:
    ````
    pm2 start server.js --name="NombreDelServidor" -i <N | max> --watch -- -p <PUERTO>
    ````

    ````
    PORT=<PUERTO> pm2 start server.js --name="NombreDelServidor" -i <N | max> --watch
    ````


    <br>

3) Configurar Nginx para redirigir todas la consultas de "/api/randmons" al servidor en modo CLUSTER:
    *   Usando el puerto 80.  
````

events {
}


http {
    include       mime.types;
    default_type  application/octet-stream;
    
    # Verificacion de balanceador de carga de los servidores en ruta "/info"
    # Servidores en puertos: 8080 y 8081, modo FORK o CLUSTER

    # upstream app_node_info {
    #     server 127.0.0.1:8080;
    #     server 127.0.0.1:8081 weight=2;
    # }
    # --------------------------------------------------------------

    # INICIO CONFIGURACION 1 de NGINX

    # upstream app_random {
    #     server 127.0.0.1:8081;
    # }

    # FIN CONFIGURACION 1
    # --------------------------------------------------------------

    # INICIO CONFIGURACION 2
    upstream app_random_2 {
        server 127.0.0.1:8082;
        server 127.0.0.1:8083;
        server 127.0.0.1:8084;
        server 127.0.0.1:8085;
    }
    # FIN CONFIGURACION 2 de NGINX
    # --------------------------------------------------------------

    server {
        listen       80;
        server_name  localhost;

        # Ruta principal de la aplicacion y proxy para carga de archivos por nodejs
        location / {
            proxy_pass http://127.0.0.1:8080;
        }


        # CONFIGURACION 1

        # location /api/randoms/ {
        #     proxy_pass http://app_random;
        # }

        # --------------------------------------------------------------


        # CONFIGURACION 2

        location /api/randoms/ {
            proxy_pass http://app_random_2;
        }

        # --------------------------------------------------------------


        # Verificacion de balanceador de carga ruta "/info"

        # location /info/ {
        #     proxy_pass http://app_node_info;
        # }
        # --------------------------------------------------------------

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}

````

4) Ejecutar ``nginx.exe`` dentro de la carpeta carpeta nginx-1.23.1
    * Verificar rutas segun corresponda, ejemplos:
        *   Ingresar a http://localhost:8080/
        *   Ingresar a http://localhost:8080/info
        *   Ingresar a http://localhost:8082/info
    
        <br>

        *   Ingresar a http://localhost:80/api/randoms
        *   Ingresar a http://localhost:80/ 
        *   Ingresar a http://localhost:80/info para comprobar puerto en 8080

    <br>

5) Usar los puntos ``5.`` , ``6.`` y ``7.`` del Ejemplo anterior ``PARTE 1``

-----
## Observaciones