import React from 'react';
import { PluggyConnect } from 'react-native-pluggy-connect';

interface PluggyConnectionProps {
  visible: boolean;
  connectToken: string | null;
  onSuccess: (accountData: any) => void;
  onClose: () => void;
}

export default function PluggyConnection({ visible, connectToken, onSuccess, onClose }: PluggyConnectionProps) {
  if (!visible || !connectToken) {
    return null;
  }

  return (
    <PluggyConnect
      connectToken={connectToken}
      includeSandbox={true}
      onOpen={() => undefined}
      onClose={onClose}
      onSuccess={onSuccess}
      onError={(error) => {
        console.error('Pluggy Error:', error);
        onClose();
      }}
    />
  );
}
