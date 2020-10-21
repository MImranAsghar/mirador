import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import { ScrollTo } from './ScrollTo';
import MiradorCanvas from '../lib/MiradorCanvas';
import SidebarIndexItem from '../containers/SidebarIndexItem';
import SidebarIndexThumbnail from '../containers/SidebarIndexThumbnail';

/** */
export class SidebarIndexList extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = { prevSequenceId: '' };
  }

  /** @private */
  getIdAndLabelOfCanvases() {
    const { canvases } = this.props;

    return canvases.map((canvas, index) => ({
      id: canvas.id,
      label: new MiradorCanvas(canvas).getLabel(),
    }));
  }

  /** @private */
  updateCurrentSequence(sequenceId) {
    const { updateSequence } = this.props;

    updateSequence(sequenceId);
    this.setState({ prevSequenceId: sequenceId });
  }

  /** */
  render() {
    const {
      canvases,
      sequence,
      sequences,
      classes,
      containerRef,
      selectedCanvasIds,
      setCanvas,
      variant,
      windowId,
    } = this.props;

    const { prevSequenceId } = this.state;

    const canvasesIdAndLabel = this.getIdAndLabelOfCanvases(canvases);
    let Item;

    switch (variant) {
      case 'thumbnail':
        Item = SidebarIndexThumbnail;
        break;
      default:
        Item = SidebarIndexItem;
    }

    return (
      <MenuList variant="selectedMenu">
        {
          canvasesIdAndLabel.map((canvas, canvasIndex) => {
            let onClick;
            if (sequences && sequences.length > 1 && prevSequenceId !== sequence.id) {
              onClick = () => { this.updateCurrentSequence(sequence.id); setCanvas(windowId, canvas.id); }; // eslint-disable-line require-jsdoc, max-len
            } else {
              onClick = () => { setCanvas(windowId, canvas.id); }; // eslint-disable-line require-jsdoc, max-len
            }

            return (
              <MenuItem
                key={canvas.id}
                className={classes.listItem}
                alignItems="flex-start"
                onClick={onClick}
                button
                component="li"
                selected={selectedCanvasIds.includes(canvas.id)}
              >
                <ScrollTo
                  containerRef={containerRef}
                  key={`${canvas.id}-${variant}`}
                  offsetTop={96} // offset for the height of the form above
                  scrollTo={selectedCanvasIds.includes(canvas.id)}
                >
                  <Item label={canvas.label} canvas={canvases[canvasIndex]} />
                </ScrollTo>
              </MenuItem>
            );
          })
        }
      </MenuList>
    );
  }
}

SidebarIndexList.propTypes = {
  canvases: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  containerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  selectedCanvasIds: PropTypes.arrayOf(PropTypes.string),
  sequence: PropTypes.shape({ id: PropTypes.string }).isRequired,
  sequences: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  setCanvas: PropTypes.func.isRequired,
  updateSequence: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['item', 'thumbnail']),
  windowId: PropTypes.string.isRequired,
};

SidebarIndexList.defaultProps = {
  selectedCanvasIds: [],
  variant: 'item',
};
