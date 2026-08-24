# omniauth 2.x defaults the OAuth request phase to POST-only, as CSRF
# protection (paired with the omniauth-rails_csrf_protection gem, which
# renders a CSRF-protected button/form instead of a plain link). The
# "Continue with Google" button is a plain top-level navigation (GET), so
# allow that too; the OAuth `state` param still protects the flow itself.
OmniAuth.config.allowed_request_methods = %i[get post]
