class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    @user = User.from_omniauth(request.env['omniauth.auth'])
    if @user.persisted?
      sign_in(resource, store: false) # triggers devise-jwt to issue token
      render json: {
        status: { code: 200, message: "Logged in successfully." },
        data: UserSerializer.new(resource).serializable_hash[:data][:attributes]
      }, status: :ok
    else
      render json: { error: "Could not authenticate" }, status: :unauthorized
    end
  end
end