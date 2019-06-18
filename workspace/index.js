/**
 * Import CSS
 */
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import 'ol/ol.css';
import 'sidebar-v2/css/ol3-sidebar.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import './static/css/map.css';
import 'popper.js';


/**
 * Import Main class
 */
import { Main } from './src/Main.js';

/**
 * Import ReadFile class
 */
import { ReadFiles } from './static/js/ReadFiles.js';

var app = new Main();

var readFiles = new ReadFiles();

//CREATE THE BASE MAP
app.createMap();
