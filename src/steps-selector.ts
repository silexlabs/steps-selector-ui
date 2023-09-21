import {LitElement, html, css} from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import {customElement, property} from 'lit/decorators.js';

import './steps-selector-item'

/**
 * @element steps-selector
 * Web component to select a sequence of steps
 * 
 * User actions:
 * - add a next step at the end of the selection
 * - reset to default value
 * - copy value to clipboard
 * - paste value from clipboard
 */

export interface Step {
  name: string
  icon: string
  type: string
  tags?: string[]
  helpText?: string
  errorText?: string
  options?: Object
  optionsForm?: Object
}

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('steps-selector')
export class StepsSelector extends LitElement {
  static override styles = css`
    :host {
      --steps-selector-dirty-color: red;
    }
    :host .dirty {
      color: var(--steps-selector-dirty-color, red);
    }
    :host .property-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  `;

  // Read only property dirty
  private _dirty = false
  get dirty() {
    return this._dirty
  }
  protected set dirty(value) {
    const oldValue = this._dirty
    this._dirty = value
    this.requestUpdate('dirty', oldValue)
  }

  // Steps currently selected
  private _steps: Step[] = []
  get steps() {
    return this._steps
  }
  set steps(value) {
    const oldValue = this._steps
    this._steps = value
    this.requestUpdate('steps', oldValue)
    this.dispatchEvent(new CustomEvent('change', {detail: {value}}));
  }

  // Initial value
  initialValue: Step[] = []

  // Get the list of steps that can be added after the given selection
  completion: (steps: Step[]) => Step[] = () => []

  override render() {
    return html`
      <div class=${classMap({dirty: this.dirty, "property-container": true})}>
        <slot name="property-name">Property Name</slot>
        ${this.dirty ? html`
          <slot name="dirty-icon" @click=${this.reset}>
            <svg viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
          </slot>
        ` : html``}
      </div>
      <div class="steps-container">
        ${this.steps
          .map((step, index) => ({
            step,
            completion: this.completion(this.steps.slice(0, index)),
          }))
          .map(({step, completion}, index) => html`
            <steps-selector-item
              key=${index}
              ?no-options-editor=${!step.optionsForm}
              @set=${(event: CustomEvent) => this.setStepAt(index, completion.find(step => step.name === event.detail.value))}
              @delete=${() => this.deleteStepAt(index)}
            >
              <div slot="icon">${step.icon}</div>
              <div slot="name">${step.name}</div>
              <ul slot="tags">
                ${step.tags?.map(tag => html`<li>${tag}</li>`)}
              </ul>
              <div slot="type">${step.type}</div>
              <div slot="helpText">${step.helpText}</div>
              <div slot="errorText">${step.errorText}</div>
              <div slot="values">
                <ul>
                  ${
                    completion
                      .map(step => html`<li value=${step.name}>${step.name}</li>`)
                  }
                </ul>
              </div>
              <div slot="options">
                <form>
                  to be generated with json to form
                </form>
              </div>
            </steps-selector-item>
          `)}
      </div>
    `;
  }

  /**
   * Set the step at the given index
   */
  setStepAt(at: number, step: Step | undefined) {
    if (step) {
      this.steps = [
        ...this.steps.slice(0, at),
        step,
        ...this.steps.slice(at + 1),
      ]
      this.dirty = true
    } else {
      console.error(`Step is undefined`)
    }
  }

  /**
   * Delete the step at the given index and all the following steps
   */
  deleteStepAt(at: number) {
    this.steps = this.steps.slice(0, at)
    this.dirty = true
  }

  /**
   * Reset dirty flag and store the current value as initial value
   */
  public save() {
    this.dirty = false
    this.initialValue = [
      ...this.steps,
    ]
  }

  /**
   * Reset dirty flag and restore the initial value
   */
  reset() {
    this.dirty = false
    this.steps = [
      ...this.initialValue,
    ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'steps-selector': StepsSelector;
  }
}
