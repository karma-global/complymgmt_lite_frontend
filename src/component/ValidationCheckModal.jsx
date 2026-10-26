import React, { useRef } from 'react';

const ValidationCheckModal = ({
  crudForm,
  crudTitle,
  isModalOpen,
  editCrudTitle,
  isEditing,
  closeModal,
}) => {
  const modalRef = useRef();


  return (
    <>
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          role="dialog"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          // onMouseDown={handleBackdropClick}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
            role="document"
            style={{
              maxWidth: '90vw',   // responsive width
            }}
          >
            <div
              className="modal-content"
              ref={modalRef}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                maxHeight: '90vh', // key for responsiveness
              }}
            >
              <div className="modal-header py-2">
                <h5 className="modal-title">
                  {isEditing ? editCrudTitle : crudTitle}
                </h5>
                <button
                  type="button"
                  className="close btn"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div className="modal-body">
                {crudForm}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ValidationCheckModal;
