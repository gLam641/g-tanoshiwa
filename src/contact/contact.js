import { useState } from 'react';
import { Prompt } from 'react-router-dom';

export default function Contact() {
    const [isBlocking] = useState(true);
    return (
        <>
            <Prompt
                when={isBlocking}
                message={(loc) => `Are you sure you want to go to ${loc.pathname}?`}
            />
            <p>
                Contact page
            </p>
        </>
    );
}