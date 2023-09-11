import { Components } from "react-formio";

const CurrencyComponent = Components.components.currency;

/**
 * Overrides the default Currency component
 *
 * Currency will support tooltip that is displayed as a popup
 * 
 */
export default class DGJCurrencyComponent extends CurrencyComponent {
    attach(element) {
        const webForm = this;
        const tooltipInfoButton = element?.children[0]?.children[1];
        const tooltipHtmlText = webForm.component.tooltip;
        // By contract, form designer should add the following
        // popup html comment in the tooltip text to force it to be opened as a popup
        const isTooltipPopup = tooltipHtmlText.includes("<!-- popup -->");
        if (isTooltipPopup && tooltipInfoButton) {
            // Removing tooltip text before popup to disable the default tooltip display
            tooltipInfoButton.setAttribute("data-tooltip", "");
            // Replacing the tooltipButton with a clone to make sure all the previous 
            // eventListeners are removed except the popup
            let newTooltipInfoButton = tooltipInfoButton.cloneNode(true);
            tooltipInfoButton.parentNode.replaceChild(
                newTooltipInfoButton,
                tooltipInfoButton
            );
            newTooltipInfoButton.addEventListener("click", function () {
                webForm.emit("customEvent", {
                    type: "popup",
                    body: tooltipHtmlText,
                });
            });
        }
        return super.attach(element);
    }
}
