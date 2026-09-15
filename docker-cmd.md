docker buildx build --platform linux/arm64 `
  --build-arg VITE_API_URL=https://api-the-pvc-house.thejanbh.com/api `
  -t thejanbh/the-pvc-house-admin:v1.0 --push .

docker run -d \
--name THE_PVC_HOUSE_admin \
-p 4003:80 \
-e VITE_API_URL=https://api-the-pvc-house.thejanbh.com/api \
thejanbh/the-pvc-house-admin:v1.0