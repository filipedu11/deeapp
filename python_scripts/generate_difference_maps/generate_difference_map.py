""" Scale TILE format bands """
import numpy as np
from osgeo import gdal
import argparse
import os, errno
import shutil
import random
import re
import pandas as pd
import glob
import json
from datetime import datetime
import seaborn as sns
import matplotlib.pyplot as plt
import colorsys

def create_map_raster(
    LULC_filepath_1, classification_json_file, 
    LULC_filepath_2, validation_json_file,
    map_output_filepath, json_output_filepath):
    """
    Creates a new raster image with the difference map between two LULC labels
    """
    raster1 = LULC_filepath_1
    raster2 = LULC_filepath_2

    ds1 = gdal.Open(raster1)
    ds2 = gdal.Open(raster2)

    r1 = np.array(ds1.ReadAsArray())
    r2 = np.array(ds2.ReadAsArray())

    classes = np.unique(r2)
    
    mapDiff = np.zeros(r2.shape)
    [cols, rows] = r2.shape

    classId = 1

    classMap = {}

    for c1 in classes:
        for c2 in classes:
            calcAux = ((r1==c1) * (r2==c2)) * classId
            mapDiff = mapDiff + calcAux
            classMap[(c1,c2)] = classId
            classId += 1

    driver = gdal.GetDriverByName("GTiff")
    outdata = driver.Create(map_output_filepath, rows, cols, 1, gdal.GDT_UInt16)
    outdata.SetGeoTransform(ds1.GetGeoTransform())
    outdata.SetProjection(ds1.GetProjection())
    band = outdata.GetRasterBand(1)
    band.WriteArray(mapDiff)
    band.SetNoDataValue(0)
    outdata.FlushCache()
    outdata = None
    ds2=None
    ds1=None

    create_json(classes, classMap, classification_json_file, validation_json_file, json_output_filepath)

    print("\n ======================================== \n")

def create_json(classes, classMap, classification_json_file, validation_json_file, json_output_filepath):

    cFileOpen = open(classification_json_file, encoding='utf8')
    vFileOpen = open(validation_json_file, encoding='utf8')
    
    
    classification_json_object = json.load(cFileOpen)
    validation_json_object = json.load(vFileOpen)

    content_json = {
        "layerID": "{}_vs_{}".format(classification_json_object["layerID"], validation_json_object["layerID"]),
        "layerName": "{} | {}".format(classification_json_object["layerName"] + ' (c)', validation_json_object["layerName"] + ' (v)'),
        "layerDescription": "Evaluation map for comparing {} with {}".format(classification_json_object["layerName"], validation_json_object["layerName"]),
        "layerRasterFile": "",
        "layerSource": {
            "author": "Eduardo Lopes",
            "classifierAlgorithm": "None",
            "preProcTechniquesUsed": [],
            "postProcTechniquesUsed": [],
            "collectedDate": "",
            "layerDate": datetime.today().strftime('%Y-%m-%d')
        },
        "layerStyle": {
            "color": {}
        },
        "classNames": {},
        "classNamesEval": {}  
    }


    color = ""
    nClasses = len(classes)
    color_palette = []
    
    
    for c in classes:
        color = classification_json_object["layerStyle"]["color"][str(c)]
        rgb = color.split('(')[1].split(')')[0].split(',')
        rgbTuple = tuple(np.array(rgb).astype(np.int) / 255)
        
        color_palette.extend(sns.dark_palette(rgbTuple, n_colors=nClasses+1, reverse=True)[1:nClasses])

    for i, c1 in enumerate(classes, 0):
        for c2 in classes:
            className = classification_json_object["classNames"][str(c1)] + ' (c)' + " | " + validation_json_object["classNames"][str(c2)] + ' (v)'
            content_json["classNames"][str(classMap[(c1,c2)])] = className

            color = classification_json_object["layerStyle"]["color"][str(c1)]
            
            if c1 != c2:
                color = 'rgb({},{},{})'.format(int(color_palette[i][0]*255), int(color_palette[i][1]*255), int(color_palette[i][2]*255))

            content_json["layerStyle"]["color"][str(classMap[(c1,c2)])] = color
                
    with open(json_output_filepath, encoding='utf-8-sig', mode="w+") as outfile:
        json.dump(content_json, outfile, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Prepare evaluation maps")
    parser.add_argument("source_filepaths", help='Filepaths to the LULC prediction files')
    parser.add_argument("target_filepaths", help='Filepath to the groundtruth LULC labels')
    args = parser.parse_args()

    countFiles = False

    validation_files =  glob.glob(args.target_filepaths + "/*.tif")
    validation_json_files = glob.glob(args.target_filepaths + "/*.json")
    classification_files =  glob.glob(args.source_filepaths + "/*.tif")
    classification_json_files = glob.glob(args.source_filepaths + "/*.json")

    output_dirpath = os.path.abspath(os.path.join(args.target_filepaths, os.pardir)) + "/evaluation"

    print("\n ======================================== \n")

    for j, filepath_t in enumerate(validation_files):
        print("Validation map selected: {}  ({}/{})".format(os.path.basename(filepath_t), j+1, len(validation_files)))
        for i, filepath in enumerate(classification_files):
            print("Generating difference map for file: {}  ({}/{})".format(os.path.basename(filepath), i+1, len(classification_files)))

            file1 = re.match("(.*).tif", os.path.basename(filepath))
            file1 = file1.groups(1)[0]
            file2 = re.match("(.*).tif", os.path.basename(filepath_t))
            file2 = file2.groups(1)[0]

            if not countFiles:
                try:
                    os.makedirs(output_dirpath)
                    countFiles = True
                except OSError as e:
                    if countFiles == 0:
                        shutil.rmtree(output_dirpath)
                        os.makedirs(output_dirpath)
                        countFiles = True
                    elif e.errno == errno.EEXIST:
                        pass
                    else:
                        raise

            map_output_filepath = output_dirpath + "/{}_VS_{}_difference_map.tif".format(file1, file2)
            json_output_filepath = output_dirpath + "/{}_VS_{}_difference_map.json".format(file1, file2)

            print(map_output_filepath)
            print(json_output_filepath)

            create_map_raster(filepath, classification_json_files[i], filepath_t, validation_json_files[j], map_output_filepath, json_output_filepath)