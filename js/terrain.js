var TerrainGenerator = TerrainGenerator || {};
(function (TerrainGenerator){

        // Splitting up the stock function to introduce my own step in between...
        // Image processing
        TerrainGenerator.CreateHeightArrayFromHeightMap = function (width, height, subdivisions, minHeight, maxHeight, buffer, bufferWidth, bufferHeight) {
            var data = [];
            var row, col;
            for (row = 0; row <= subdivisions; row++) {
                data[row] = [];
                for (col = 0; col <= subdivisions; col++) {
                    var position = new BABYLON.Vector3((col * width) / subdivisions - (width / 2.0), 0, ((subdivisions - row) * height) / subdivisions - (height / 2.0));
                    // Compute height
                    var heightMapX = (((position.x + width / 2) / width) * (bufferWidth - 1)) | 0;
                    var heightMapY = ((1.0 - (position.z + height / 2) / height) * (bufferHeight - 1)) | 0;
                    var pos = (heightMapX + heightMapY * bufferWidth) * 4;
                    var r = buffer[pos] / 255.0;
                    var g = buffer[pos + 1] / 255.0;
                    var b = buffer[pos + 2] / 255.0;
                    var gradient = r * 0.3 + g * 0.59 + b * 0.11;
                    data[row][col] = minHeight + (maxHeight - minHeight) * gradient;
                }
            }
            return data;
        };

        TerrainGenerator.GenerateTerrainFromHeightArray = function(data, dataWidth, dataHeight, widthSubdivisions, heightSubdivisions){
          var modW = widthSubdivisions / dataWidth;
          var modH = heightSubdivisions / dataHeight;
          for(var i=0;i< widthSubdivisions; ++i){
            for(var j=0;i<heightSubdivisions; ++j){
              if(i%modW == 0 && j%modH == 0) da
            }
          }
          return data;        
        };


        // Vertex generation
        TerrainGenerator.CreateVertexDataFromHeightArray = function (data, dataWidth, dataHeight, width, height) {
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];
            var row, col;
            for (row = 0; row <= dataHeight; row++) {
                for (col = 0; col <= dataWidth; col++) {
                    // Add  vertex
                    // This way 0,0 will be at the center of the map.
                    positions.push((col * width) / dataWidth - (width / 2.0),
                                   data[row][col], 
                                   ((dataHeight - row) * height) / dataHeight - (height / 2.0));
                    normals.push(0, 0, 0); //It will be calculated later..
                    uvs.push(col / dataWidth, 1.0 - row / dataHeight);
                }
            }
            for (row = 0; row < dataHeight; row++) {
                for (col = 0; col < dataWidth; col++) {
                    indices.push(col + 1 + (row + 1) * (dataWidth + 1));
                    indices.push(col + 1 + row * (dataWidth + 1));
                    indices.push(col + row * (dataWidth + 1));
                    indices.push(col + (row + 1) * (dataWidth + 1));
                    indices.push(col + 1 + (row + 1) * (dataWidth + 1));
                    indices.push(col + row * (dataWidth + 1));
                }
            }
            // Normals
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);
            // Result
            var vertexData = new BABYLON.VertexData();
            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;
            return vertexData;
        };


        TerrainGenerator.CreateGroundFromHeightMap = function (name, url, width, height, subdivisions, minHeight, maxHeight, scene, updatable, onReady) {
            var ground = new BABYLON.GroundMesh(name, scene);
//            ground._subdivisions = subdivisions;
            ground._setReady(false);
            var onload = function (img) {
                // Getting height map data
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                var heightMapWidth = img.width;
                var heightMapHeight = img.height;
                canvas.width = heightMapWidth;
                canvas.height = heightMapHeight;
                context.drawImage(img, 0, 0);
                // Create VertexData from map data
                var buffer = context.getImageData(0, 0, heightMapWidth, heightMapHeight).data;
                var heightArray = TerrainGenerator.CreateHeightArrayFromHeightMap(width, height, subdivisions, minHeight, maxHeight, buffer, heightMapWidth, heightMapHeight);
                var vertexData = TerrainGenerator.CreateVertexDataFromHeightArray(heightArray, subdivisions, subdivisions, width, height);
                vertexData.applyToMesh(ground, updatable);
                ground._setReady(true);
                //execute ready callback, if set
                if (onReady) {
                    onReady(ground);
                }
            };
            BABYLON.Tools.LoadImage(url, onload, function () {}, scene.database);

            return ground;
        };

        // Function from lib... used as an example
        TerrainGenerator.CreateVertexDataFromHeightMap = function (width, height, subdivisions, minHeight, maxHeight, buffer, bufferWidth, bufferHeight) {
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];
            var row, col;
            for (row = 0; row <= subdivisions; row++) {
                for (col = 0; col <= subdivisions; col++) {
                    var position = new BABYLON.Vector3((col * width) / subdivisions - (width / 2.0), 0, ((subdivisions - row) * height) / subdivisions - (height / 2.0));
                    // Compute height
                    var heightMapX = (((position.x + width / 2) / width) * (bufferWidth - 1)) | 0;
                    var heightMapY = ((1.0 - (position.z + height / 2) / height) * (bufferHeight - 1)) | 0;
                    var pos = (heightMapX + heightMapY * bufferWidth) * 4;
                    var r = buffer[pos] / 255.0;
                    var g = buffer[pos + 1] / 255.0;
                    var b = buffer[pos + 2] / 255.0;
                    var gradient = r * 0.3 + g * 0.59 + b * 0.11;
                    position.y = minHeight + (maxHeight - minHeight) * gradient;
                    // Add  vertex
                    positions.push(position.x, position.y, position.z);
                    normals.push(0, 0, 0);
                    uvs.push(col / subdivisions, 1.0 - row / subdivisions);
                }
            }
            for (row = 0; row < subdivisions; row++) {
                for (col = 0; col < subdivisions; col++) {
                    indices.push(col + 1 + (row + 1) * (subdivisions + 1));
                    indices.push(col + 1 + row * (subdivisions + 1));
                    indices.push(col + row * (subdivisions + 1));
                    indices.push(col + (row + 1) * (subdivisions + 1));
                    indices.push(col + 1 + (row + 1) * (subdivisions + 1));
                    indices.push(col + row * (subdivisions + 1));
                }
            }
            // Normals
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);
            // Result
            var vertexData = new BABYLON.VertexData();
            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;
            return vertexData;
        };
}(TerrainGenerator));
