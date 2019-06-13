import React, { Component } from 'react';
import validate from 'validate.js'

class FormGroup extends Component {

  render() {
    var validateError = this.props.validateError;
    var formClass="form-group " + (validateError ? 'has-error':'');

    return (
      <div className={formClass}>
        {
          this.props.label !== false ?
            <label htmlFor={this.props.id}>{this.props.label}</label> : null
        }
        
        {this.props.children}
        {
          validateError ? 
            <p className="help-block">{validateError[0]}</p> : null
        }
      </div>      
    );
  }
}

export default FormGroup;