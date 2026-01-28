import ConfirmModal from "@/components/ui/ConfirmModal";
import React from "react";

type Props = {
  confirmExitVisible: boolean;
  setConfirmExitVisible: (v: boolean) => void;
  onConfirmExit: () => void;

  confirmSaveVisible: boolean;
  setConfirmSaveVisible: (v: boolean) => void;
  onConfirmSave: () => void;
};

export default function ProductConfirmModals({
  confirmExitVisible,
  setConfirmExitVisible,
  onConfirmExit,
  confirmSaveVisible,
  setConfirmSaveVisible,
  onConfirmSave,
}: Props) {
  return (
    <>
      <ConfirmModal
        visible={confirmExitVisible}
        title="Salir"
        message="¿Seguro que deseas salir? Los cambios no guardados se perderán."
        icon="alert-circle"
        confirmText="Salir"
        cancelText="Cancelar"
        onCancel={() => setConfirmExitVisible(false)}
        onConfirm={onConfirmExit}
      />

      <ConfirmModal
        visible={confirmSaveVisible}
        title="Guardar cambios"
        message="¿Deseas guardar los cambios realizados en este producto?"
        icon="checkmark-circle"
        confirmText="Guardar"
        cancelText="Cancelar"
        onCancel={() => setConfirmSaveVisible(false)}
        onConfirm={onConfirmSave}
      />
    </>
  );
}
