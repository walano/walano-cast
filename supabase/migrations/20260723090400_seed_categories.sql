-- WalanoCast — the 5 launch categories as presets of the 2-axis system (spec §2)

insert into public.categories (name, slug, description, checkout_fields, delivery_type, inventory_kind, post_payment_instructions) values

('Clé d''abonnement', 'cle-abonnement',
 'Recevez votre clé d''activation instantanément après validation du paiement.',
 '[]'::jsonb,
 'auto_inventory', 'item',
 'Votre clé est prête ! Elle ne sera affichée qu''une seule fois — copiez-la précieusement. Commande {{order_ref}}.'),

('Profil', 'profil',
 'Un profil personnel sur un compte partagé (Netflix, Prime Video, …), avec votre nom et votre code PIN.',
 '[{"key":"profile_name","label":"Nom du profil","type":"text","max":30,"required":true},{"key":"profile_pin","label":"Code PIN","type":"pin","digits":4,"required":true}]'::jsonb,
 'auto_inventory', 'slot',
 'Votre profil est prêt ! Connectez-vous avec l''adresse du compte affichée ci-dessus, puis choisissez le profil « {{profile_name}} ». Un souci ? Écrivez-nous : {{whatsapp_link}} (commande {{order_ref}}).'),

('Top-up', 'top-up',
 'Recharge directe sur votre propre compte (Snapchat+, …).',
 '[{"key":"platform_username","label":"Votre identifiant sur la plateforme","type":"text","max":50,"required":true}]'::jsonb,
 'manual_action', 'none',
 'Paiement validé ! Ajoutez @saint_walano sur Snapchat pour activer votre recharge, ou écrivez-nous : {{whatsapp_link}} (commande {{order_ref}}).'),

('Compte personnel', 'compte-personnel',
 'Un compte rien qu''à vous, créé avec votre adresse e-mail.',
 '[{"key":"account_email","label":"Votre adresse e-mail (réelle et utilisable)","type":"email","required":true}]'::jsonb,
 'manual_action', 'none',
 'Votre compte est prêt ! Identifiants ci-dessus. Changez le mot de passe dès votre première connexion. Commande {{order_ref}}.'),

('Compte partagé', 'compte-partage',
 'Accès à un compte partagé (Spotify, …) livré instantanément.',
 '[]'::jsonb,
 'auto_inventory', 'item',
 'Votre accès est prêt ! Utilisez le lien/les identifiants ci-dessus. En cas de problème, écrivez-nous directement : {{whatsapp_link}} (commande {{order_ref}}).');
