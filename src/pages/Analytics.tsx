
import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';

// Mock data for the charts - this would be replaced with real data from API
const genreData = [
  { name: 'Fiction', value: 35, color: '#8884d8' },
  { name: 'Non-Fiction', value: 20, color: '#82ca9d' },
  { name: 'Mystery', value: 15, color: '#ffc658' },
  { name: 'Science', value: 10, color: '#ff8042' },
  { name: 'History', value: 12, color: '#0088fe' },
  { name: 'Biography', value: 8, color: '#00C49F' }
];

const readingData = [
  { name: 'Mon', books: 2 },
  { name: 'Tue', books: 3 },
  { name: 'Wed', books: 1 },
  { name: 'Thu', books: 4 },
  { name: 'Fri', books: 2 },
  { name: 'Sat', books: 5 },
  { name: 'Sun', books: 3 }
];

const Analytics = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout 
      title="Reading Analytics" 
      breadcrumbs={[
        { label: 'Dashboard', path: user?.role === 'librarian' ? '/librarian' : '/member' }, 
        { label: 'Analytics' }
      ]}
    >
      <div className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
            <CardHeader>
              <CardTitle>Reading by Day</CardTitle>
              <CardDescription>Number of books read in the past week</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={readingData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="books" name="Books Read" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
            <CardHeader>
              <CardTitle>Reading by Genre</CardTitle>
              <CardDescription>Distribution of genres read</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} Books`, name]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Reading Summary</CardTitle>
            <CardDescription>Your reading statistics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <h4 className="text-2xl font-bold text-primary">20</h4>
                <p className="text-sm text-muted-foreground">Books This Month</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <h4 className="text-2xl font-bold text-primary">87</h4>
                <p className="text-sm text-muted-foreground">Books This Year</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <h4 className="text-2xl font-bold text-primary">Fiction</h4>
                <p className="text-sm text-muted-foreground">Favorite Genre</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <h4 className="text-2xl font-bold text-primary">4.2 hrs</h4>
                <p className="text-sm text-muted-foreground">Avg. Reading Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
