import { Components } from 'react-formio';

const PanelComponent = Components.components.panel;

/**
 * Overrides the default Formio panel component
 * 
 * Adds a `dgj-panel-<theme>` class to the wrapper of the panel component so it can be used
 * for styling the components based on the selected theme
 */
export default class DGJPanelComponent extends PanelComponent {
    render(el) {
        const content = super.render(el);
        return content.replace('class="mb-2 card border"', `class="mb-2 card border dgj-panel-${this.component?.theme}"`);
    }
}