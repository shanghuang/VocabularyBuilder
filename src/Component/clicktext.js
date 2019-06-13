import React, { Component } from 'react';
import validate from 'validate.js'

class ClickText extends Component {


  render() {
    let VOCAB_STATUS={
      Familiar:0,
      JustLearned:1,
      NotInVocabulary:2
    }
    var color = { color:'black', 'padding-right': '10px'};
    if( this.props.word_info.selected ) { 
      color = { color:'red', 'padding-right': '10px' };
    }
    else if(this.props.word_info.voc_status == VOCAB_STATUS.JustLearned){
      color = { color:'pink', 'padding-right': '10px' };
    }
    else if(this.props.word_info.voc_status == VOCAB_STATUS.NotInVocabulary){
      color = { color:'green', 'padding-right': '10px' };
    }

    return(
      <span style={color} onClick={this.props.clickHandler}>
        {this.props.word_info.word}
      </span>      
    );
  }
}

export default ClickText;