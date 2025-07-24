# class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
#   def google_oauth2
#     @user = User.from_omniauth(request.env['omniauth.auth'])
#     if @user.persisted?
#       sign_in(resource, store: false) # triggers devise-jwt to issue token
#       render json: {
#         status: { code: 200, message: "Logged in successfully." },
#         data: UserSerializer.new(resource).serializable_hash[:data][:attributes]
#       }, status: :ok
#     else
#       render json: { error: "Could not authenticate" }, status: :unauthorized
#     end
#   end
# end

class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    @user = User.from_omniauth(request.env['omniauth.auth'])
    
    if @user.persisted?
      # Generate JWT manually using Devise JWT's method
      jwt_payload = { 'sub' => @user.id, 'jti' => @user.jti }
      token = Warden::JWTAuth::UserEncoder.new.call(@user, :user, nil).first
      
      # Redirect to frontend with token in URL (you'll extract it client-side)
      redirect_to "http://localhost:5173/auth/callback?token=#{token}", allow_other_host: true
    else
      redirect_to "http://localhost:5173/auth/failure", allow_other_host: true
    end
  end
end