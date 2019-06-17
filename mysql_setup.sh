docker-machine create --driver virtualbox Camagru
docker-machine start Camagru
docker-machine env Camagru
eval $(docker-machine env Camagru)
echo "ifconfig eth1 192.168.99.50 netmask 255.255.255.0 broadcast 192.168.99.255 up" | docker-machine ssh prova-discovery sudo tee /var/lib/boot2docker/bootsync.sh > /dev/null
echo "kill `more /var/run/udhcpc.eth1.pid`\nifconfig eth1 192.168.99.50 netmask 255.255.255.0 broadcast 192.168.99.255 up" | docker-machine ssh prova-discovery sudo tee /var/lib/boot2docker/bootsync.sh > /dev/null
# run command only the first time.
# docker-machine regenerate-certs prova-discovery
docker run --name mysql-db -p 3306:3306 -e MYSQL_ROOT_PASSWORD='root' -d mysql:5.7
docker start mysql-db
docker exec -it mysql-db /bin/bash