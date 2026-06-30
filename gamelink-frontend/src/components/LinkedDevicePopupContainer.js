import React, { useState } from 'react';
import LinkedDevicePopup from './LinkedDevicePopup';

export default function LinkedDevicePopupContainer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="tournament-action" onClick={() => setOpen(true)}>
        Linked devices
      </button>
      <LinkedDevicePopup open={open} onClose={() => setOpen(false)} />
    </>
  );
}

