/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";

import './backend-ai-error-log-list';
import 'weightless/card';

import {BackendAIPage} from './backend-ai-page';
import {BackendAiStyles} from './backend-ai-console-styles';
import {
    IronFlex,
    IronFlexAlignment,
    IronFlexFactors,
    IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

@customElement("backend-ai-error-log-view")
export default class BackendAIErrorLogView extends BackendAIPage {

  @property({type: Object}) _lists = Object();

  constructor() {
      super();
  }

  static get styles() {
      return [
          BackendAiStyles,
          IronFlex,
          IronFlexAlignment,
          IronFlexFactors,
          IronPositioning,
          // language=CSS
          css`
          wl-card h3.tab {
              padding-top: 0;
              padding-bottom: 0;
              padding-left: 0;
              }
          `
      ];
  }

  firstUpdated() {
      this._lists = this.shadowRoot.querySelectorAll("backend-ai-session-list");
  }

  render() {
      // language=HTML
      return html `
      <wl-card class="item" elevation="1">
        <backend-ai-error-log-list active="true"></backend-ai-error-log-list>
      </wl-card>
      `;
  }
}

declare global {
    interface HTMLElementTagNameMap {
        "backend-ai-error-log-view": BackendAIErrorLogView;
    }
}
