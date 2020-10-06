/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';
import {store} from '../store';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import 'weightless/card';
import 'weightless/switch';
import 'weightless/select';
import 'weightless/tab';
import 'weightless/tab-group';
import 'weightless/icon';
import 'weightless/button';

import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-button/mwc-button';

import './backend-ai-dialog';
import './lablup-activity-panel';
import './lablup-codemirror';
import './lablup-loading-spinner';
import './backend-ai-error-log-list';
import './backend-ai-usersettings-general-list';

/**
 Backend AI Usersettings View

 Example:

 <backend-ai-usersettings-view active>
  ...
 </backend-ai-usersettings-view>

 @group Backend.AI Console
 @element backend-ai-usersettings-view
 */

@customElement("backend-ai-usersettings-view")
export default class BackendAiUserSettingsView extends BackendAIPage {
  public spinner: any;

  @property({type: Object}) images = Object();
  @property({type: Object}) options = Object();
  @property({type: Object}) _activeTab = Object();
  @property({type: Object}) clearLogsDialog = Object();
  @property({type: Object}) logGrid = Object();

  constructor() {
    super();
    this.options = {
      automatic_image_update: false,
      cuda_gpu: false,
      cuda_fgpu: false,
      rocm_gpu: false,
      tpu: false,
      scheduler: 'fifo'
    }
  }

  static get is() {
    return 'backend-ai-usersettings-view';
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
        div.spinner,
        span.spinner {
          font-size: 9px;
          margin-right: 5px;
        }

        wl-card > div {
          padding: 15px;
        }

        wl-card h3.tab {
          padding-top: 0;
          padding-bottom: 0;
          padding-left: 0;
        }

        wl-card wl-card {
          margin: 0;
          padding: 0;
          --card-elevation: 0;
        }

        wl-tab-group {
          --tab-group-indicator-bg: var(--paper-teal-600);
        }

        wl-tab {
          --tab-color: #666666;
          --tab-color-hover: #222222;
          --tab-color-hover-filled: #222222;
          --tab-color-active: var(--paper-teal-600);
          --tab-color-active-hover: var(--paper-teal-600);
          --tab-color-active-filled: #cccccc;
          --tab-bg-active: var(--paper-teal-200);
          --tab-bg-filled: var(--paper-teal-200);
          --tab-bg-active-hover: var(--paper-teal-200);
        }

        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        mwc-button {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
        }

        mwc-button[unelevated] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
        }

        mwc-button[outlined] {
          background-image: none;
          --mdc-button-outline-width: 2px;
          --mdc-button-disabled-outline-color: var(--general-button-background-color);
          --mdc-button-disabled-ink-color: var(--general-button-background-color);
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
        }

        mwc-button.log {
          margin: 0px 10px;
        }

        mwc-button.operation {
          margin: 0px 5px;
        }

        .outer-space {
          margin: 20px;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <!--<wl-card class="item">-->
        <lablup-activity-panel noheader narrow horizontalsize="3x">
        <div slot="message">
          <h3 class="tab horizontal wrap layout">
            <mwc-tab-bar>
              <mwc-tab aria-label="general" label="${_t("usersettings.General")}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab aria-label="logs" label="${_t("usersettings.Logs")}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            </mwc-tab-bar>
            <!--<wl-tab-group>
              <wl-tab value="general" checked @click="${(e) => this._showTab(e.target)}">${_t("usersettings.General")}</wl-tab>
              <wl-tab value="logs" @click="${(e) => this._showTab(e.target)}">${_t("usersettings.Logs")}</wl-tab>
            </wl-tab-group>-->
          </h3>
          <div id="general" class="item tab-content outer-space">
            <backend-ai-usersettings-general-list active="true"></backend-ai-usersettings-general-list>
          </div>
          <div id="logs" class="item tab-content" style="display:none;">
            <h3 class="horizontal center layout outer-space">
              <span>${_t("logs.LogMessages")}</span>
              <span class="mini" style="font-size:13px;padding-left:15px;">${_t("logs.UpTo5000Logs")}</span>
              <span class="flex"></span>
              <mwc-button
                  class="log"
                  icon="refresh"
                  outlined
                  label="${_t("button.Refresh")}"
                  @click="${() => this._refreshLogs()}"></mwc-button>
              <mwc-button
                  class="log"
                  icon="delete"
                  outlined
                  label="${_t("button.ClearLogs")}"
                  @click="${() => this._showClearLogsDialog()}"></mwc-button>
              <!--<wl-button class="fg cyan" inverted outlined @click="${() => this._refreshLogs()}" style="margin: 0px 10px;">
                <wl-icon>refresh</wl-icon>
                ${_t("button.Refresh")}
              </wl-button>
              <wl-button class="fg teal" inverted outlined @click="${() => this._showClearLogsDialog()}" style="margin: 0px 10px;">
                <wl-icon>delete</wl-icon>
                ${_t("button.ClearLogs")}
            </wl-button>-->
            </h3>
            <backend-ai-error-log-list active="true"></backend-ai-error-log-list>
          </div>
        </div>
      </lablup-activity-panel>
      <!--</wl-card>-->
      <backend-ai-dialog id="clearlogs-dialog" fixed backdrop scrollable blockScrolling>
        <span slot="title">${_t("dialog.warning.LogDeletion")}</span>
        <div slot="content">${_t("dialog.warning.CannotBeUndone")}</div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              class="operation"
              id="discard-removal"
              label="${_t("button.No")}"
              @click="${() => this._hideClearLogsDialog()}"></mwc-button>
          <mwc-button
              unelevated
              class="operation"
              id="apply-removal"
              label="${_t("button.Yes")}"
              @click="${() => this._removeLogMessage()}"></mwc-button>
          <!--<wl-button inverted flat id="discard-removal"
                     style="margin: 0 5px;"
                     @click="${() => this._hideClearLogsDialog()}">${_t("button.No")}</wl-button>
          <wl-button id="apply-removal" class="button"
                     style="margin: 0 5px;"
                     @click="${() => this._removeLogMessage()}">${_t("button.Yes")}</wl-button>-->
        </div>
      </backend-ai-dialog>
    `;
  }

  firstUpdated() {
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateSettings();
      }, true);
    } else { // already connected
      this.updateSettings();
    }
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    // this._activeTab = "general";
    this.clearLogsDialog = this.shadowRoot.querySelector('#clearlogs-dialog');
    document.addEventListener('backend-ai-usersettings-logs', () => {
      this._viewStateChanged(true);
    });
    document.addEventListener('backend-ai-usersettings', () => {
      this._viewStateChanged(true);
    })
  }

  /**
   * Change view state when the user clicks the tab.
   *
   * @param {Boolean} active
   * */
  async _viewStateChanged(active) {
    const params = store.getState().app.params;
    const tab = params.tab;
    if (tab && tab === 'logs') {
      globalThis.setTimeout(() => {
        const tabEl = this.shadowRoot.querySelector('mwc-tab[aria-label="logs"]');
        tabEl.click();
      }, 0);
    } else {
      globalThis.setTimeout(() => {
        const tabEl = this.shadowRoot.querySelector('mwc-tab[aria-label="general"]');
        tabEl.click();
      }, 0);
    }
  }

  updateSettings() {
  }

  /**
   * Hide clearLogsDialog.
   * */
  _hideClearLogsDialog() {
    this.clearLogsDialog.hide();
  }

  /**
   * Remove log message.
   * */
  _removeLogMessage() {
    let currentLogs = localStorage.getItem('backendaiconsole.logs');
    if (currentLogs) {
      localStorage.removeItem('backendaiconsole.logs');
    }
    let event = new CustomEvent("log-message-clear", {});
    document.dispatchEvent(event);
    localStorage.getItem('backendaiconsole.logs');
    this.clearLogsDialog.hide();
    this.notification.text = 'Log Messages have been removed.';
    this.notification.show();
    this.spinner.hide();
  }

  /**
   * Show clearLogsDialog.
   * */
  _showClearLogsDialog() {
    this.clearLogsDialog.show();
  }

  /**
   * Refresh log messages.
   * */
  _refreshLogs() {
    this.logGrid = JSON.parse(localStorage.getItem('backendaiconsole.logs') || '{}');
    let event = new CustomEvent("log-message-refresh", this.logGrid);
    document.dispatchEvent(event);
  }

  /**
   * Show only one tab clicked by user.
   *
   * @param {EventTarget} tab - clicked tab
   * */
  _showTab(tab) {
    let els = this.shadowRoot.querySelectorAll(".tab-content");
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this._activeTab = tab.ariaLabel;
    if (this._activeTab === 'logs') {
      this._refreshLogs();
    }
    this.shadowRoot.querySelector('#' + tab.ariaLabel).style.display = 'block';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-usersettings-view": BackendAiUserSettingsView;
  }
}
