Rails.application.routes.draw do
  devise_for :users, path: "", path_names: {
    sign_in: "login",
    sign_out: "logout",
    registration: "signup"
  },
  controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }
  resources :sounds do
    member do
      get "in_folders"
      patch "set_folders"
    end
    collection do
      get "my_sounds"
    end
  end

  resources :tags
  resources :folders, param: :slug do
    member do
      post "add_sound"
      delete "remove_sound"
    end
    collection do
      get "my_folders"
      get "folder_slug_list"
    end
  end
  # get "my_folders", to: "folders#my_folders"
  # get "folder_slug_list", to: "folders#folder_slug_list"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
