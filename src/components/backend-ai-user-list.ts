/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {render} from 'lit-html';

import './lablup-loading-spinner';
import './backend-ai-dialog';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';

import '../plastics/lablup-shields/lablup-shields';

import 'weightless/button';
import 'weightless/card';
import 'weightless/snackbar';
import 'weightless/switch';
import 'weightless/textarea';
import 'weightless/textfield';

import '@material/mwc-button/mwc-button';
import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-textarea/mwc-textarea';
import '@material/mwc-switch/mwc-switch';

import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-general-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend AI User List

 `backend-ai-user-list` is list of user details.
 Through this, user information can be read or modified, and the user can be logged out.

 Example:

 <backend-ai-user-list>
 ...
 </backend-ai-user-list>

 @group Backend.AI Console
 @element backend-ai-user-list
 */

@customElement("backend-ai-user-list")
export default class BackendAIUserList extends BackendAIPage {
  @property({type: Boolean}) isAdmin = false;
  @property({type: Boolean}) editMode = false;
  @property({type: Object}) users = Object();
  @property({type: Object}) userInfo = Object();
  @property({type: Array}) userInfoGroups = Array();
  @property({type: String}) condition = 'active';
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) spinner;
  @property({type: Object}) keypairs;
  @property({type: Object}) signoutUserDialog = Object();
  @property({type: String}) signoutUserName = '';
  @property({type: Object}) notification = Object();
  @property({type: Object}) userGrid = Object();
  @property({type: Number}) _totalUserCount = 0;

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
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 235px);
        }

        backend-ai-dialog h4,
        backend-ai-dialog wl-label {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
          border-bottom: 1px solid #DDD;
        }

        wl-label {
          font-family: Roboto;
        }

        wl-switch {
          margin-right: 15px;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.configuration {
          width: 70px !important;
        }

        backend-ai-dialog wl-textfield,
        backend-ai-dialog wl-textarea {
          padding-left: 15px;
          --input-font-family: var(--general-font-family);
          --input-color-disabled: #222;
          --input-label-color-disabled: #222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #ccc;
        }

        backend-ai-dialog li {
          font-family: var(--general-font-family);
          font-size: 16px;
        }

        wl-textfield:not([disabled]),
        wl-textarea:not([disabled]) {
          margin-bottom: 15px;
          width: 280px;
        }

        wl-button {
          --button-bg: var(--paper-light-green-50);
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
          color: var(--paper-green-900);
        }

        mwc-button, mwc-button[unelevated], mwc-button[outlined] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
          --mdc-typography-font-family: var(--general-font-family);
        }

        mwc-textfield, mwc-textarea {
          width: 100%;
          --mdc-typography-font-family: var(--general-font-family);
          --mdc-typography-textfield-font-size: 14px;
          --mdc-typography-textarea-font-size: 14px;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--general-textfield-selected-color);
        }

        p.label {
          font-size: 16px;
          font-family: var(--general-font-family);
          color: var(--general-sidebar-color);
          width: 270px;
        }
      `];
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.signoutUserDialog = this.shadowRoot.querySelector('#signout-user-dialog');
  }

  /**
   * If active is true, change view state
   *
   * @param {Boolean} active - boolean value that determines whether view state is changed or not
   * */
  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshUserData();
        this.isAdmin = globalThis.backendaiclient.is_admin;
        this.userGrid = this.shadowRoot.querySelector('#user-grid');
      }, true);
    } else { // already connected
      this._refreshUserData();
      this.isAdmin = globalThis.backendaiclient.is_admin;
      this.userGrid = this.shadowRoot.querySelector('#user-grid');
    }
  }

  _refreshUserData() {
    let is_active = true;
    switch (this.condition) {
      case 'active':
        is_active = true;
        break;
      default:
        is_active = false;
    }
    this.spinner.hide();
    let fields = ['email', 'username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups {id name}'];
    return globalThis.backendaiclient.user.list(is_active, fields).then((response) => {
      let users = response.users;
      //Object.keys(users).map((objectKey, index) => {
      //var user = users[objectKey];
      // Blank for the next impl.
      //});
      this.users = users;
      this._totalUserCount = this.users.length;
      //setTimeout(() => { this._refreshKeyData(status) }, 5000);
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  async _editUserDetail(e) {
    this.editMode = true;
    return this._showUserDetailDialog(e);
  }

  async _showUserDetail(e) {
    this.editMode = false;
    return this._showUserDetailDialog(e);
  }

  async _showUserDetailDialog(e) {
    const controls = e.target.closest('#controls');
    const user_id = controls['user-id'];
    let groupNames;
    try {
      const data = await this._getUserData(user_id);
      this.userInfo = data.user;
      groupNames = this.userInfo.groups.map((item) => {
        return item.name;
      });
      this.userInfoGroups = groupNames;
      this.shadowRoot.querySelector('#user-info-dialog').show();
    } catch (err) {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    }
  }

  _signoutUserDialog(e) {
    const controls = e.target.closest('#controls');
    const user_id = controls['user-id'];
    this.signoutUserName = user_id;
    this.signoutUserDialog.show();
  }

  _signoutUser() {
    globalThis.backendaiclient.user.delete(this.signoutUserName).then(response => {
      this.notification.text = PainKiller.relieve('Signout finished.');
      this._refreshUserData();
      this.signoutUserDialog.hide();
    }).catch((err) => {   // Signout failed
      console.log(err);
      if (typeof err.message !== "undefined") {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
      } else {
        this.notification.text = PainKiller.relieve('Signout failed. Check your permission and try again.');
      }
      this.notification.show();
    });
  }

  async _getUserData(user_id) {
    let fields = ['email', 'username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups {id name}'];
    return globalThis.backendaiclient.user.get(user_id, fields);
  }

  refresh() {
    this._refreshUserData();
  }

  _isActive() {
    return this.condition === 'active';
  }

  /**
   * Return elapsed time
   *
   * @param {Date} start
   * @param {Date} end
   * */
  _elapsed(start, end) {
    var startDate = new Date(start);
    if (this.condition == 'active') {
      var endDate = new Date();
    } else {
      var endDate = new Date();
    }
    var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    var days = Math.floor(seconds / 86400);
    return days;
  }

  /**
   * Date to UTC string
   *
   * @param {Date} d - date
   * */
  _humanReadableTime(d) {
    return new Date(d).toUTCString();
  }

  /**
   * Render index to root element.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  _indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  /**
   * Return an unlimited mark if unlimited sign is included.
   * */
  _markIfUnlimited(value) {
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  /**
   * Control rendering - showUserDetail, editUserDetail, signoutUserDialog.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
          .user-id="${rowData.item.email}">
          <wl-button fab flat inverted
            class="fg green"
            icon="assignment"
            @click="${(e) => this._showUserDetail(e)}">
            <wl-icon>assignment</wl-icon>
          </wl-button>
          <wl-button fab flat inverted
            class="fg blue"
            icon="settings"
            @click="${(e) => this._editUserDetail(e)}">
            <wl-icon>settings</wl-icon>
          </wl-button>

          ${globalThis.backendaiclient.is_superadmin && this._isActive() ? html`
            <wl-button fab flat inverted class="fg red controls-running"
                               @click="${(e) => this._signoutUserDialog(e)}">
                               <wl-icon>delete_forever</wl-icon>
            </wl-button>
          ` : html``}
        </div>
      `, root
    );
  }

  /**
   * Save any changes. - username, full_name, password, etc.
   *
   * @param {Event} event - click SaveChanges button
   * */
  _saveChanges(event) {
    const username = this.shadowRoot.querySelector('#username').value,
      full_name = this.shadowRoot.querySelector('#full_name').value,
      password = this.shadowRoot.querySelector('#password').value,
      confirm = this.shadowRoot.querySelector('#confirm').value,
      description = this.shadowRoot.querySelector('#description').value,
      is_active = this.shadowRoot.querySelector('#is_active').checked,
      need_password_change = this.shadowRoot.querySelector('#need_password_change').checked;

    if (password !== confirm) {
      this.notification.text = "Password and Confirmation do not match.";
      this.notification.show();
      return;
    }
    let input: any = Object();

    if (password !== '')
      input.password = password;

    if (username !== this.userInfo.username)
      input.username = username;

    if (full_name !== this.userInfo.full_name)
      input.full_name = full_name;

    if (description !== this.userInfo.description)
      input.description = description;

    if (need_password_change !== this.userInfo.need_password_change)
      input.need_password_change = need_password_change;

    if (is_active !== this.userInfo.is_active)
      input.is_active = is_active;

    if (Object.entries(input).length === 0) {
      this._hideDialog(event);

      this.notification.text = "No Changes Made";
      this.notification.show();

      return;
    }

    globalThis.backendaiclient.user.modify(this.userInfo.email, input)
      .then(res => {
        if (res.modify_user.ok) {
          this.shadowRoot.querySelector("#user-info-dialog").hide();

          this.notification.text = "Successfully Modified";
          this.userInfo = {...this.userInfo, ...input, password: null};
          this._refreshUserData();
          this.shadowRoot.querySelector("#password").value = "";
          this.shadowRoot.querySelector("#confirm").value = "";
        } else {
          this.notification.text = `Error: ${res.modify_user.msg}`;

          this.shadowRoot.querySelector("#username").value = this.userInfo.username;
          this.shadowRoot.querySelector("#description").value = this.userInfo.description;
        }

        this.notification.show();
      })
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <vaadin-grid theme="row-stripes column-borders compact"
                   aria-label="User list" id="user-grid" .items="${this.users}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center"
                            .renderer="${this._indexRenderer.bind(this)}"></vaadin-grid-column>
        <vaadin-grid-filter-column path="email" header="${_t("credential.UserID")}" resizable></vaadin-grid-filter-column>
        <vaadin-grid-filter-column resizable header="${_t("credential.Name")}" path="username"></vaadin-grid-filter-column>
        <vaadin-grid-column resizable header="${_t("general.Control")}"
            .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="signout-user-dialog" fixed backdrop>
        <span slot="title">Let's double-check</span>
        <div slot="content">
          <p>You are inactivating the user <span style="color:red">${this.signoutUserName}</span>.</p>
          <p>${_t("dialog.ask.DoYouWantToProceed")}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout distancing">
          <mwc-button
              label="${_t("button.Cancel")}"
              @click="${(e) => this._hideDialog(e)}"></mwc-button>
          <mwc-button
              unelevated
              label="${_t("button.Okay")}"
              @click="${() => this._signoutUser()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="user-info-dialog" fixed backdrop narrowLayout>
        <div slot="title" class="horizontal center layout">
          <span style="margin-right:15px;">${_t("credential.UserDetail")}</span>
          <lablup-shields app="" description="user" ui="flat"></lablup-shields>
        </div>
        <div slot="content" class="horizontal layout" style="overflow-x:hidden;">
          <div>
            <h4>${_text("credential.Information")}</h4>
            <div role="listbox" class="center vertical layout">
              <mwc-textfield
                  disabled
                  label="${_text("credential.UserID")}"
                  pattern="^[a-zA-Z0-9_-]+$"
                  value="${this.userInfo.email}"></mwc-textfield>
              <mwc-textfield
                  ?disabled=${!this.editMode}
                  label="${_text("credential.UserName")}"
                  id="username"
                  pattern="^[a-zA-Z0-9_ ]*$"
                  value="${this.userInfo.username}"></mwc-textfield>
              <mwc-textfield
                  ?disabled=${!this.editMode}
                  label="${_text("credential.FullName")}"
                  pattern="^[a-zA-Z0-9_ ]*$"
                  value="${this.userInfo.full_name ? this.userInfo.full_name : ' '}"
                  ></mwc-textfield>
              ${this.editMode ? html`
                <mwc-textfield
                    type="password"
                    id="password"
                    label="${_text("general.NewPassword")}"></mwc-textfield>
                <mwc-textarea
                    type="text"
                    id="description"
                    label="${_text("credential.Description")}"
                    id="password"></mwc-textfield>`: html``}
              ${this.editMode ? html`
                <div class="horizontal layout center" style="margin:10px;">
                  <p class="label">${_text("credential.DescActiveUser")}</p>
                  <mwc-switch
                      id="is_active"
                      ?checked="${this.userInfo.is_active}"></mwc-switch>
                </div>
                <div class="horizontal layout center" style="margin:10px;">
                  <p class="label">${_text("credential.DescRequirePasswordChange")}</p>
                  <mwc-switch
                      id="need_password_change"
                      ?checked=${this.userInfo.need_password_change}></mwc-switch>
                </div>` : html`
                    <mwc-textfield
                        disabled
                        label="${_text("credential.DescActiveUser")}"
                        value="${this.userInfo.is_active ? `${_text('button.Yes')}` : `${_text('button.No')}`}"></mwc-textfield>
                    <mwc-textfield
                        disabled
                        label="${_text("credential.DescRequirePasswordChange")}"
                        value="${this.userInfo.need_password_change ? `${_text('button.Yes')}` : `${_text('button.No')}`}"></mwc-textfield>
            `}
          </div>
        </div>
        ${this.editMode ? html`` : html`
          <div>
            <h4>${_text("credential.Association")}</h4>
            <div role="listbox" style="margin: 0;">
              <wl-textfield
                label="${_t("credential.Domain")}"
                disabled
                value="${this.userInfo.domain_name}">
              </wl-textfield>
              <wl-textfield
                label="${_t("credential.Role")}"
                disabled
                value="${this.userInfo.role}">
              </wl-textfield>
            </div>
            <h4>${_text("credential.ProjectAndGroup")}</h4>
            <div role="listbox" style="margin: 0;">
              <ul>
              ${this.userInfoGroups.map(item => html`
                <li>${item}</li>
              `)}
              </ul>
            </div>
          </div>
        `}
        </div>
        <div slot="footer" class="horizontal end-justified flex layout distancing">
        ${this.editMode ? html`
          <mwc-button
              unelevated
              label="${_t("button.SaveChanges")}"
              icon="check"
              @click=${e => this._saveChanges(e)}></mwc-button>`:html``}
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-user-list": BackendAIUserList;
  }
}
