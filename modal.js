export function createModal(modalId, modalTitle, modalBody, modalFooter) {
  // Remove existing modal if it exists
  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    existingModal.remove();
  }

  const modalTemplate = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="${modalId}Label">${modalTitle}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                ${modalBody}
              </div>
              <div class="modal-footer">
                ${modalFooter}
              </div>
            </div>
          </div>
        </div>
      `;

  document.body.insertAdjacentHTML("beforeend", modalTemplate);
  const modalElement = document.getElementById(modalId);
  const modalInstance = new bootstrap.Modal(modalElement);

  modalElement.addEventListener("hidden.bs.modal", () => {
    modalElement.remove();
  });

  return modalInstance;
}
