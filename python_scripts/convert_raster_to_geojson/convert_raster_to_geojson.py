import subprocess
import glob
from osgeo import gdal, ogr, osr
import os, errno
import shutil
import json
import sys
import math
import shapely.wkt
import argparse
import os
from area import area

script = os.path.dirname(os.path.abspath(__file__)) +'/gdal_polygonize_64.py'


def computeStatsForEachPolygon(feature):

    poly = feature['geometry']
    
    # Return the area in hectare, perimeter in km and number of vertices of polygon
    return area(poly)/10000, 0, 0


def convert_raster_to_geojson(in_dir):
    
    input_dir = in_dir

    output_dir_name = '/output/'

    example_project_output_dir = input_dir + output_dir_name

    countFiles = 0

    # Convert coordinates system to the default used and generate the base for geojson file
    for in_file in glob.glob(input_dir + "/*.tif"):

        # Open the raster file
        input_file = gdal.Open(in_file)
        in_file_name = in_file.split('\\')[-1][:-4]


        input_info_data = json.load(open(in_file[:-4] + '.json', encoding='utf-8-sig'))

        CLASS_NAMES = input_info_data["classNames"]

        # Create the output dir (if exist, remove all content and create the output dir)
        try:
            os.makedirs( example_project_output_dir )
        except OSError as e:
            if countFiles == 0:
                shutil.rmtree( example_project_output_dir )
                os.makedirs( example_project_output_dir )
            elif e.errno == errno.EEXIST:
                pass
            else:
                raise

        # Path variable to create a auxiliar raster to convert the coordinate system / projection
        output_file_aux = example_project_output_dir + in_file_name + '_out.tif'

        # Convert the coordinate system
        gdal.Warp(output_file_aux, input_file, dstSRS='EPSG:4326')

        # Path variable to create the geojson file
        out_file = output_file_aux[:-4] + ".geojson"

        print("\n-------------- CONVERT RASTER TO GEOJSON FILE ----------------\n")
        # call the script that allow the conversion from raster to polygon 
        subprocess.call(["python",script,output_file_aux,'-f','GeoJSON',out_file])

        # remove the raster with the new projections
        os.remove(output_file_aux)

        print("\n-------------- CONSTRUCT THE GEOJSON ACCORDING DEFINED SCHEMAS ----------------\n")

        with open(out_file, encoding='utf-8-sig') as f:
            data = json.load(f)
            count = 1

            data.update(input_info_data)

            data_features_length = len(data['features'])

            for feature in data['features']:

                perc_read = math.floor((count / data_features_length) * 100)
                sys.stdout.write("Progress: %d%%   \r" % (perc_read) )
                sys.stdout.flush()

                # Create a ID for each feature
                feature['properties']['featureId'] = count
                count+=1
                feature['properties']['classId'] = feature['properties'].pop('DN')

                # Set className input in feature properties
                feature['properties']['className'] = CLASS_NAMES[str(feature['properties']['classId'])]
                feature['properties']['areaInHectare'], feature['properties']['perimeterInKm'], feature['properties']['numVertices'] = computeStatsForEachPolygon(feature)

                classesOfEvalFeat = feature['properties']['className'].split(' | ')

                if len(classesOfEvalFeat) > 1:
                    feature['properties']['classificationClass'] = classesOfEvalFeat[0]
                    feature['properties']['validationClass'] = classesOfEvalFeat[1]


            print("\n-------------- WRITE THE FINAL GEOJSON FILE ----------------\n")

            #Write the new geojson file
            with open(out_file, encoding='utf-8-sig', mode="w+") as newFile:
                json.dump(data, newFile, ensure_ascii=False, indent=2)

            countFiles+=1
            print("\n-------------- PROCESS FINISH FOR FILE " + out_file.split('/')[-1] + " ----------------\n")

if __name__ == '__main__':
    #try:
    input_dir = sys.argv[1]
    convert_raster_to_geojson(input_dir)
        
    #except:
    #    print('convert_raster_to_geojson.py path_dir_tif_files_and_info_json_file')

    

