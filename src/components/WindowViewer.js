import React, { Component, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import difference from 'lodash/difference';
import flatten from 'lodash/flatten';
import WindowCanvasNavigationControls from '../containers/WindowCanvasNavigationControls';
import MiradorCanvas from '../lib/MiradorCanvas';

const OSDViewer = lazy(() => import('../containers/OpenSeadragonViewer'));

/**
 * Represents a WindowViewer in the mirador workspace. Responsible for mounting
 * OSD and Navigation
 */
export class WindowViewer extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = {};
  }

  /** */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  /**
   * componentDidMount - React lifecycle method
   * Request the initial canvas on mount
   */
  componentDidMount() {
    const {
      currentCanvases, fetchInfoResponse, fetchAnnotation, receiveAnnotation,
    } = this.props;

    if (!this.infoResponseIsInStore()) {
      currentCanvases.forEach((canvas) => {
        const miradorCanvas = new MiradorCanvas(canvas);
        miradorCanvas.iiifImageResources.forEach((imageResource) => {
          fetchInfoResponse({ imageResource });
        });
        miradorCanvas.processAnnotations(fetchAnnotation, receiveAnnotation);
      });
    }
  }

  /**
   * componentDidUpdate - React lifecycle method
   * Request a new canvas if it is needed
   */
  componentDidUpdate(prevProps) {
    const {
      currentCanvases, fetchInfoResponse, fetchAnnotation, receiveAnnotation,
    } = this.props;

    if (difference(currentCanvases, prevProps.currentCanvases).length > 0
    && !this.infoResponseIsInStore()) {
      currentCanvases.forEach((canvas) => {
        const miradorCanvas = new MiradorCanvas(canvas);
        miradorCanvas.iiifImageResources.forEach((imageResource) => {
          fetchInfoResponse({ imageResource });
        });
        miradorCanvas.processAnnotations(fetchAnnotation, receiveAnnotation);
      });
    }
  }

  /**
   * infoResponseIsInStore - checks whether or not an info response is already
   * in the store. No need to request it again.
   * @return [Boolean]
   */
  infoResponseIsInStore() {
    const responses = this.currentInfoResponses();
    if (responses.length === this.imageServiceIds().length) {
      return true;
    }
    return false;
  }

  /** */
  imageServiceIds() {
    const { currentCanvases } = this.props;

    return flatten(currentCanvases.map(canvas => new MiradorCanvas(canvas).imageServiceIds));
  }

  /**
   * currentInfoResponses - Selects infoResponses that are relevent to existing
   * canvases to be displayed.
   */
  currentInfoResponses() {
    const { infoResponses } = this.props;

    return this.imageServiceIds().map(imageId => (
      infoResponses[imageId]
    )).filter(infoResponse => (infoResponse !== undefined
      && infoResponse.isFetching === false
      && infoResponse.error === undefined));
  }

  /**
   * Return an image information response from the store for the correct image
   */
  infoResponsesFetchedFromStore() {
    const responses = this.currentInfoResponses();
    // Only return actual tileSources when all current canvases have completed.
    if (responses.length === this.imageServiceIds().length) {
      return responses;
    }
    return [];
  }

  /**
   * Renders things
   */
  render() {
    const { windowId } = this.props;

    const { hasError } = this.state;

    if (hasError) {
      return <></>;
    }

    return (
      <Suspense fallback={<div />}>
        <OSDViewer
          infoResponses={this.infoResponsesFetchedFromStore()}
          windowId={windowId}
        >
          <WindowCanvasNavigationControls key="canvas_nav" windowId={windowId} />
        </OSDViewer>
      </Suspense>
    );
  }
}

WindowViewer.propTypes = {
  currentCanvases: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  fetchAnnotation: PropTypes.func.isRequired,
  fetchInfoResponse: PropTypes.func.isRequired,
  infoResponses: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  receiveAnnotation: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};
