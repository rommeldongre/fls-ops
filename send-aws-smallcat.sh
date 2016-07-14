cd ~/dev/workspace/fls-ops
cd build
scp -i ~/dev/rom-test.pem fls-ops.war ubuntu@54.179.148.235:/tmp
ssh -i ~/dev/rom-test.pem ubuntu@54.179.148.235
