# Fire Protection Tracker

A production-ready work progress and completion tracking system for fire protection companies.

## Features

- **Authentication**: Secure login/register with Supabase Auth
- **Project Management**: Track fire protection projects and jobs
- **Task Management**: Assign and monitor individual tasks
- **Time Tracking**: Clock in/out functionality with reporting
- **Work Documentation**: Photo uploads and notes for completed work
- **Dashboard**: Overview statistics and quick actions
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Hosting**: Cloudflare Pages
- **Icons**: Heroicons

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd fire-protection-tracker
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create a `.env` file:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Set up database tables:**
   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Enable RLS
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT NOT NULL,
     full_name TEXT,
     role TEXT DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create clients table
   CREATE TABLE clients (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     contact_person TEXT,
     email TEXT,
     phone TEXT,
     address TEXT,
     created_by UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create projects table
   CREATE TABLE projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
     client_id UUID REFERENCES clients(id),
     created_by UUID REFERENCES auth.users(id),
     due_date TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create tasks table
   CREATE TABLE tasks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     description TEXT,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
     priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
     assigned_to UUID REFERENCES auth.users(id),
     created_by UUID REFERENCES auth.users(id),
     due_date TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create time_logs table
   CREATE TABLE time_logs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id),
     start_time TIMESTAMP WITH TIME ZONE NOT NULL,
     end_time TIMESTAMP WITH TIME ZONE,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create work_documentation table
   CREATE TABLE work_documentation (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id),
     photo_url TEXT,
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create storage bucket for work photos
   INSERT INTO storage.buckets (id, name, public) VALUES ('work-photos', 'work-photos', true);

   -- Set up RLS policies
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
   ALTER TABLE work_documentation ENABLE ROW LEVEL SECURITY;

   -- Profiles policies
   CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

   -- Clients policies
   CREATE POLICY "Users can view all clients" ON clients FOR SELECT USING (true);
   CREATE POLICY "Users can insert clients" ON clients FOR INSERT WITH CHECK (auth.uid() = created_by);
   CREATE POLICY "Users can update clients" ON clients FOR UPDATE USING (auth.uid() = created_by);

   -- Projects policies
   CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
   CREATE POLICY "Users can insert projects" ON projects FOR INSERT WITH CHECK (auth.uid() = created_by);
   CREATE POLICY "Users can update projects" ON projects FOR UPDATE USING (auth.uid() = created_by);

   -- Tasks policies
   CREATE POLICY "Users can view all tasks" ON tasks FOR SELECT USING (true);
   CREATE POLICY "Users can insert tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
   CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to);

   -- Time logs policies
   CREATE POLICY "Users can view all time logs" ON time_logs FOR SELECT USING (true);
   CREATE POLICY "Users can insert time logs" ON time_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own time logs" ON time_logs FOR UPDATE USING (auth.uid() = user_id);

   -- Work documentation policies
   CREATE POLICY "Users can view all work docs" ON work_documentation FOR SELECT USING (true);
   CREATE POLICY "Users can insert work docs" ON work_documentation FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own work docs" ON work_documentation FOR UPDATE USING (auth.uid() = user_id);

   -- Storage policies
   CREATE POLICY "Users can upload work photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'work-photos');
   CREATE POLICY "Users can view work photos" ON storage.objects FOR SELECT USING (bucket_id = 'work-photos');
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## Deployment to Cloudflare Pages

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages:**
   - Connect your GitHub repository to Cloudflare Pages
   - Set build command: `npm run build`
   - Set build output directory: `dist`
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Custom domain (optional):**
   - Configure your custom domain in Cloudflare Pages settings

## Usage

### For Administrators/Managers:
1. **Create Projects**: Add new fire protection projects with client information
2. **Assign Tasks**: Break down projects into specific tasks and assign to technicians
3. **Monitor Progress**: View dashboard for project status and completion rates
4. **Review Documentation**: Check work photos and notes from completed tasks

### For Technicians:
1. **View Tasks**: See assigned tasks with priorities and deadlines
2. **Clock In/Out**: Track time spent on tasks and projects
3. **Document Work**: Upload photos and add notes for completed work
4. **Update Status**: Mark tasks as in-progress or completed

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Navigation.tsx   # Top navigation bar
│   └── ProtectedRoute.tsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── lib/               # Utility libraries
│   └── supabase.ts    # Supabase client configuration
├── pages/             # Page components
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── ProjectsPage.tsx
│   ├── RegisterPage.tsx
│   ├── TasksPage.tsx
│   ├── TimeTrackingPage.tsx
│   └── WorkDocsPage.tsx
└── style.css          # Global styles with Tailwind
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.