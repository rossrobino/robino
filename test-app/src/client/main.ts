`customElements.define(
	"page-defer",
	class extends HTMLElement {
		connectedCallback() {
			const id = this.dataset.id;
			const t = document.querySelector<HTMLElement>("[data-id='" + id + "']");

			if (t) {
				if (t.hasAttribute("data-clear")) {
					t.removeAttribute("data-clear");
					t.innerHTML = "";
				}
				t.innerHTML += this.dataset.html ?? "";
			}
		}
	},
);`;
