'use strict';
import maplibregl from 'maplibre-gl';
import mapStyle from './style.json';
import styles from '!!raw-loader!./Map.css';
import maplibreStyles from '!!raw-loader!../../../../../node_modules/maplibre-gl/dist/maplibre-gl.css';
export default class Map extends HTMLElement {
  static get observedAttributes() {
    return [
      'data-map-state',
      'data-map-mode',
      'data-map-layers',
      'data-active-layers',
      'data-clickable-layers',
      'data-zoom',
      'data-center',
      'data-location'
    ];
  }

  constructor() {
    // Always call super first in constructor
    super();

    // Create a shadow root
    const shadow = this.attachShadow({ mode: 'open' });

    // Creating styles
    this.styles = document.createElement('style');
    this.styles.textContent = styles;
    // Adding maplibre styles
    this.maplibreStyles = document.createElement('style');
    this.maplibreStyles.textContent = maplibreStyles;
    shadow.appendChild(this.maplibreStyles);
    shadow.appendChild(this.styles);

    // Attach the created element to the shadow DOM
    this.mapWrapper = document.createElement('section');
    this.mapWrapper.id = 'map-wrapper';
    const mapContainer = document.createElement('article');
    mapContainer.id = 'map';
    this.mapWrapper.appendChild(mapContainer);
    shadow.appendChild(this.mapWrapper);

    // Check for custom center point
    let center = this.getAttribute('data-center');
    center !== null ? (center = center.split(',')) : 0;
    const zoom = this.getAttribute('data-zoom');

    this.map = new maplibregl.Map({
      container: mapContainer,
      style: mapStyle,
      center: center !== null ? [center[0], center[1]] : [-83.1, 42.36],
      zoom: zoom !== null ? zoom : 9,
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'data-map-state': {
        const tempMap = this;
        const locationPoint = JSON.parse(this.getAttribute('data-location'));
        let clickableLayers = this.getAttribute('data-clickable-layers');
        clickableLayers =
          clickableLayers !== null ? clickableLayers.split(',') : [];

        if (newValue === 'init') {
          this.map.addControl(new maplibregl.NavigationControl());
          this.map.on('load', () => {
            const mapImgs = JSON.parse(this.getAttribute('data-map-images'));
            if (mapImgs) {
              // Load an image from an external URL.
              mapImgs.forEach((img) => {
                this.map.loadImage(img.source, (error, image) => {
                  if (error) throw error;
                  // Add the image to the map style.
                  if (!this.map.hasImage(img.id)) {
                    this.map.addImage(img.id, image);
                  }
                });
              });
            }
          });
          this.map.on('style.load', () => {
            this.map.resize();

            if (locationPoint) {
              const coord = [
                locationPoint.location.x,
                locationPoint.location.y,
              ];
              const marker = new maplibregl.Marker();
              marker.setLngLat(coord);
              marker.addTo(this.map);
              this.map.flyTo({
                // These options control the ending camera position: centered at
                // the target, at zoom level 9, and north up.
                center: coord,
                zoom: 12,
                bearing: 0,

                // These options control the flight curve, making it move
                // slowly and zoom out almost completely before starting
                // to pan.
                speed: 1.5, // make the flying slow
                curve: 1, // change the speed at which it zooms out

                // This can be any easing function: it takes a number between
                // 0 and 1 and returns another number between 0 and 1.
                easing: function (t) {
                  return t;
                },

                // this animation is considered essential with respect to prefers-reduced-motion
                essential: true,
              });
            }

            const mapData = JSON.parse(this.getAttribute('data-map-data'));
            if (mapData) {
              const tempSource = { type: 'geojson' };
              mapData.source ? (tempSource.data = mapData.source) : 0;
              mapData.sourceCluster
                ? (tempSource.cluster = mapData.sourceCluster)
                : 0;
              mapData.sourceClusterMaxZoom
                ? (tempSource.clusterMaxZoom = mapData.sourceClusterMaxZoom)
                : 0;
              mapData.sourceClusterRadius
                ? (tempSource.clusterRadius = mapData.sourceClusterRadius)
                : 0;
              this.map.addSource('data-points', tempSource);

              mapData.layers.forEach((layer) => {
                const tmpLayer = this.buildLayer(layer);
                this.map.addLayer(tmpLayer);
              });
            }
          });
          // Creating this temp variable for workaround with dealing with "this" encapsulation

          this.map.on('click', 'data-points', function (e) {
            let activeData;
            let popupStructure;
            switch (tempMap.getAttribute('data-map-mode')) {
              case 'my-home-info':
                popupStructure = JSON.parse(
                  tempMap.getAttribute('data-popup-structure'),
                );
                activeData = tempMap.getAttribute('data-map-active-data');
                tempMap.buildPopup(activeData, popupStructure, tempMap, e);
                break;

              case 'popup':
                popupStructure = JSON.parse(
                  tempMap.getAttribute('data-popup-structure'),
                );
                activeData = tempMap.getAttribute('data-map-active-data');
                tempMap.buildPopup(activeData, popupStructure, tempMap, e);
                break;

              case 'map-panel': {
                const parentComponentName = tempMap.getAttribute(
                  'data-parent-component',
                );
                const app = document.getElementsByTagName(parentComponentName);
                app[0].setAttribute(
                  'data-panel-data',
                  JSON.stringify(e.features[0]),
                );
                app[0].setAttribute('data-app-state', 'active-panel');
                break;
              }

              default:
                break;
            }
          });

          this.map.on('mouseenter', 'data-points', function () {
            tempMap.map.getCanvas().style.cursor = 'pointer';
          });

          // Change it back to a pointer when it leaves.
          this.map.on('mouseleave', 'data-points', function () {
            tempMap.map.getCanvas().style.cursor = '';
          });
        } else {
          clickableLayers.forEach((layer) => {
            tempMap.map.on('click', layer, function (e) {
              let popupStructure;
              let popupLayers = tempMap.getAttribute('data-popup-layers');
              popupLayers = popupLayers !== null ? JSON.parse(popupLayers) : [];
              let zoomLayers = tempMap.getAttribute('data-zoom-layers');
              zoomLayers = zoomLayers !== null ? JSON.parse(zoomLayers) : [];
              if (popupLayers.includes(e.features[0].layer.id)) {
                popupStructure = JSON.parse(
                  tempMap.getAttribute('data-popup-structure'),
                );
                tempMap.buildPopup(
                  e.features[0].layer.source,
                  popupStructure,
                  tempMap,
                  e,
                );
              } else if (zoomLayers.includes(e.features[0].layer.id)) {
                const zoom = tempMap.map.getZoom() + 1;
                tempMap.map.easeTo({
                  center: e.features[0].geometry.coordinates,
                  zoom,
                });
              } else {
                const parentComponentName = tempMap.getAttribute(
                  'data-parent-component',
                );
                const app = document.getElementsByTagName(parentComponentName);
                app[0].setAttribute(
                  'data-panel-data',
                  JSON.stringify(e.features[0]),
                );
                app[0].setAttribute('data-app-state', 'active-panel');
              }
            });

            tempMap.map.on('mouseenter', layer, function () {
              tempMap.map.getCanvas().style.cursor = 'pointer';
            });

            tempMap.map.on('mouseleave', layer, function () {
              tempMap.map.getCanvas().style.cursor = '';
            });
          });
        }

        break;
      }

      case 'data-map-mode': {
        // Get map mode
        const mapMode = this.getAttribute('data-map-mode');
        switch (mapMode) {
          case 'my-home-info': {
            const parentComponentName = this.getAttribute(
              'data-parent-component',
            );
            const app = document.getElementsByTagName(parentComponentName);
            const closeMapBtn = document.createElement('cod-button');
            closeMapBtn.addEventListener('click', () => {
              app[0] ? app[0].setAttribute('data-app-state', 'results') : 0;
            });
            closeMapBtn.innerText = 'x';
            closeMapBtn.setAttribute('size', 'large');
            closeMapBtn.setAttribute('variant', 'warning');
            this.mapWrapper.appendChild(closeMapBtn);
            app[0] ? app[0].setAttribute('data-map-state', 'init') : 0;
            break;
          }

          case 'single-location': {
            break;
          }

          case 'data-location': {
            const locationPoint = JSON.parse(this.getAttribute('data-location'));
            if (locationPoint) {
              const coord = [
                locationPoint.location.x,
                locationPoint.location.y,
              ];
              const marker = new maplibregl.Marker();
              marker.setLngLat(coord);
              marker.addTo(this.map);
              this.map.flyTo({
                // These options control the ending camera position: centered at
                // the target, at zoom level 9, and north up.
                center: coord,
                zoom: 12,
                bearing: 0,

                // These options control the flight curve, making it move
                // slowly and zoom out almost completely before starting
                // to pan.
                speed: 1.5, // make the flying slow
                curve: 1, // change the speed at which it zooms out

                // This can be any easing function: it takes a number between
                // 0 and 1 and returns another number between 0 and 1.
                easing: function (t) {
                  return t;
                },

                // this animation is considered essential with respect to prefers-reduced-motion
                essential: true,
              });
            }
            break;
          }

          default:
            break;
        }
        break;
      }

      case 'data-map-layers': {
        let sources = this.getAttribute('data-map-layers');
        const tmpMap = this.map;
        if (sources) {
          this.map.on('style.load', () => {
            sources = JSON.parse(sources);
            sources.forEach((source) => {
              const tempSource = {}
              if(source.sourceType == 'vector'){
                tempSource.type = 'vector';
                tempSource.tiles = [source.source];
              }else{
                tempSource.type = 'geojson';
                source.source ? (tempSource.data = source.source) : 0;
                source.sourceCluster
                  ? (tempSource.cluster = source.sourceCluster)
                  : 0;
                source.sourceClusterMaxZoom
                  ? (tempSource.clusterMaxZoom = source.sourceClusterMaxZoom)
                  : 0;
                source.sourceClusterRadius
                  ? (tempSource.clusterRadius = source.sourceClusterRadius)
                  : 0;
              }
              tmpMap.addSource(source.name, tempSource);

              source.layers.forEach((layer) => {
                const tmpLayer = this.buildLayer(layer);
                this.map.addLayer(tmpLayer);
                tmpLayer.clickable ? this.updateClickableLayers(tmpLayer) : 0;
              });
            });
          });
        }
        break;
      }

      case 'data-active-layers': {
        break;
      }

      case 'data-clickable-layers': {
        this.setAttribute('data-map-state', 'reload');
        break;
      }

      case 'data-zoom': {
        this.map.setZoom(newValue);
        break;
      }

      case 'data-center': {
        const tempCenter = newValue.split(',');
        this.map.setCenter([tempCenter[0], tempCenter[1]]);
        break;
      }

      default:
        break;
    }
  }

  updateClickableLayers(layer) {
    let clickableLayers =
      this.getAttribute('data-clickable-layers') === null
        ? ''
        : this.getAttribute('data-clickable-layers');
    const tempClickableLayers = clickableLayers.split(',');
    clickableLayers = [];
    clickableLayers = tempClickableLayers;
    clickableLayers.push(layer.id);
    clickableLayers = clickableLayers.filter((l) => l !== '');
    clickableLayers = clickableLayers.join(',');
    this.setAttribute('data-clickable-layers', clickableLayers);
  }

  buildLayer(layer) {
    const tmpLayer = { id: layer.name };
    switch (layer.type) {
      case 'line':
        tmpLayer.type = layer.type;
        tmpLayer.source = layer.source;
        layer.sourceLayer ? tmpLayer['source-layer'] = layer.sourceLayer : 0;
        layer.minZoom ? (tmpLayer.minzoom = layer.minZoom) : 0;
        layer.maxZoom ? (tmpLayer.maxzoom = layer.maxZoom) : 0;
        layer.active
          ? (tmpLayer.layout = { visibility: 'visible' })
          : (tmpLayer.layout = { visibility: 'none' });
        layer.width
          ? (tmpLayer.paint = {
              'line-color': layer.color,
              'line-width': layer.width,
            })
          : (tmpLayer.paint = { 'line-color': layer.color });
        return tmpLayer;

      case 'text':
        tmpLayer.type = 'symbol';
        tmpLayer.source = layer.source;
        layer.sourceLayer ? tmpLayer['source-layer'] = layer.sourceLayer : 0;
        layer.minZoom ? (tmpLayer.minzoom = layer.minZoom) : 0;
        layer.maxZoom ? (tmpLayer.maxzoom = layer.maxZoom) : 0;
        layer.filter ? (tmpLayer.filter = layer.filter) : 0;
        layer.active
          ? (tmpLayer.layout = {
              visibility: 'visible',
              'text-field': layer.textVariable
                ? layer.text
                : ['get', layer.text],
              'text-font': ['Arial Unicode MS Regular'],
            })
          : (tmpLayer.layout = {
              visibility: 'none',
              'text-field': layer.textVariable
                ? layer.text
                : ['get', layer.text],
              'text-font': ['Arial Unicode MS Regular'],
            });
        return tmpLayer;

      case 'image':
        tmpLayer.type = 'symbol';
        tmpLayer.source = layer.source;
        layer.sourceLayer ? tmpLayer['source-layer'] = layer.sourceLayer : 0;
        layer.minZoom ? (tmpLayer.minzoom = layer.minZoom) : 0;
        layer.maxZoom ? (tmpLayer.maxzoom = layer.maxZoom) : 0;
        layer.filter ? (tmpLayer.filter = layer.filter) : 0;
        layer.active
          ? (tmpLayer.layout = {
              visibility: 'visible',
              'icon-image': layer.img,
              'icon-size': layer.imgSize,
            })
          : (tmpLayer.layout = {
              visibility: 'none',
              'icon-image': layer.img,
              'icon-size': layer.imgSize,
            });
        return tmpLayer;

      case 'circle':
        tmpLayer.type = layer.type;
        tmpLayer.source = layer.source;
        layer.sourceLayer ? tmpLayer['source-layer'] = layer.sourceLayer : 0;
        tmpLayer.clickable = layer.clickable;
        layer.minZoom ? (tmpLayer.minzoom = layer.minZoom) : 0;
        layer.maxZoom ? (tmpLayer.maxzoom = layer.maxZoom) : 0;
        layer.filter ? (tmpLayer.filter = layer.filter) : 0;
        layer.active
          ? (tmpLayer.layout = { visibility: 'visible' })
          : (tmpLayer.layout = { visibility: 'none' });
        layer.sort
          ? (tmpLayer['fill-sort-key'] = layer.sort)
          : (tmpLayer['fill-sort-key'] = 1);
        tmpLayer.paint = {
          'circle-radius': layer.radius ? layer.radius : 5,
          'circle-color': layer.color,
        };
        return tmpLayer;

      case 'fill':
        tmpLayer.type = layer.type;
        tmpLayer.source = layer.source;
        layer.sourceLayer ? tmpLayer['source-layer'] = layer.sourceLayer : 0;
        tmpLayer.clickable = layer.clickable;
        layer.minZoom ? (tmpLayer.minzoom = layer.minZoom) : 0;
        layer.maxZoom ? (tmpLayer.maxzoom = layer.maxZoom) : 0;
        layer.filter ? (tmpLayer.filter = layer.filter) : 0;
        layer.active
          ? (tmpLayer.layout = { visibility: 'visible' })
          : (tmpLayer.layout = { visibility: 'none' });
        layer.sort
          ? (tmpLayer['fill-sort-key'] = layer.sort)
          : (tmpLayer['fill-sort-key'] = 1);
        layer.opacity
          ? (tmpLayer.paint = {
              'fill-color': layer.color,
              'fill-opacity': layer.opacity,
            })
          : (tmpLayer.paint = { 'fill-color': layer.color });
        return tmpLayer;

      default:
        break;
    }
  }

  buildPopup(dataType, structure, map, e) {
    let popupHTML = '';
    structure[dataType].forEach((elem) => {
      popupHTML += this.buildPopupElement(elem, e.features[0].properties);
    });
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(popupHTML)
      .addTo(map.map);
  }

  buildPopupElement(elem, data) {
    switch (elem.type) {
      case 'field-value':
        return `<p><strong>${elem.label}</strong> ${data[elem.value]}</p>`;

      case 'field-link':
        return `<p><strong>${elem.label}</strong> <a href="${
          data[elem.link]
        }" target="_blank">${data[elem.value]}</a></p>`;

      case 'field-image':
        return `<img style="width:100%" src="${elem.path}${data[elem.url]}${
          elem.format
        }" Alt="${data[elem.alt]}">`;

      default:
        break;
    }
  }
}
