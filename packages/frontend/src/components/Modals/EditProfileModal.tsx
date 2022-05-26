import React, { useState } from 'react';
import Modal, { Props as ModalProps } from '@/components/Modals';
import { useGetUserQuery, useUpdateUserMutation } from '@/store/services/user';
import type { SafeUserUpdate } from '@/prisma/types';

//union type for all the keys of SafeUserUpdate
type Fields = keyof SafeUserUpdate;
//create
let fields: Fields[] = ['displayName', 'username', 'email', 'bio'];

export default function EditProfile({ isOpen, closeModal, title }: ModalProps) {
  const { data: userData } = useGetUserQuery();
  const [state, setState] = useState<SafeUserUpdate>({
    ...userData
  });
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={title}>
      <form
        className='edit-profile-modal'
        onSubmit={(e) => {
          e.preventDefault();
          updateUser(state);
        }}
      >
        {fields.map((f: string) => {
          return (
            <div key={f} className='field'>
              <label htmlFor={`field__${f}`} className='field__label'>
                {f}
              </label>
              <input
                type='text'
                className={`field__input`}
                id={`field__${f}`}
                value={state[f] || ''}
                onChange={(e) => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      [f]: e.target.value,
                    };
                  });
                }}
                disabled={isUpdatingUser}
              />
            </div>
          );
        })}
        <button type='submit' disabled={isUpdatingUser}>
          Save
        </button>
      </form>
    </Modal>
  );
}
