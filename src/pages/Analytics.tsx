
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [genreData, setGenreData] = useState<{name: string, value: number, color: string}[]>([]);
  const [readingData, setReadingData] = useState<{name: string, books: number}[]>([]);
  const [readingSummary, setReadingSummary] = useState({
    booksThisMonth: 0,
    booksThisYear: 0,
    favoriteGenre: '',
    avgReadingTime: '0 hrs'
  });
  
  // Define colors for pie chart
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user's reservation data from Supabase
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('user_id', user.id)
          .eq('item_type', 'book');
          
        if (error) throw error;
        
        // Get book details for these reservations
        const bookIds = reservations.map(res => res.item_id);
        
        if (bookIds.length > 0) {
          const { data: books, error: booksError } = await supabase
            .from('books')
            .select('id, title, genres')
            .in('id', bookIds);
            
          if (booksError) throw booksError;
          
          // Process genre data
          const genreCounts: Record<string, number> = {};
          books?.forEach(book => {
            if (book.genres) {
              book.genres.forEach((genre: string) => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
              });
            }
          });
          
          const processedGenreData = Object.entries(genreCounts)
            .map(([name, value], index) => ({
              name,
              value,
              color: colors[index % colors.length]
            }))
            .sort((a, b) => b.value - a.value);
          
          setGenreData(processedGenreData);
          
          // Create mock reading data (weekly) - this would be replaced with real data
          // In a real app, you'd have a table tracking when users finish books
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const mockReadingData = days.map(day => ({
            name: day,
            books: Math.floor(Math.random() * 5) + 1 // Random 1-5 books
          }));
          
          setReadingData(mockReadingData);
          
          // Calculate reading summary
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          // Get reservations from this month and year
          const thisMonthReservations = reservations.filter(res => {
            const date = new Date(res.end_date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          });
          
          const thisYearReservations = reservations.filter(res => {
            const date = new Date(res.end_date);
            return date.getFullYear() === currentYear;
          });
          
          // Find favorite genre
          let favoriteGenre = 'N/A';
          if (processedGenreData.length > 0) {
            favoriteGenre = processedGenreData[0].name;
          }
          
          setReadingSummary({
            booksThisMonth: thisMonthReservations.length,
            booksThisYear: thisYearReservations.length,
            favoriteGenre,
            avgReadingTime: '4.2 hrs' // This would come from tracking data in a real app
          });
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [user]);

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="h-80">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="h-80">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-secondary/50 p-4 rounded-lg">
                <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <DashboardLayout 
      title="Reading Analytics" 
      breadcrumbs={[
        { label: 'Dashboard', path: user?.role === 'librarian' ? '/librarian' : '/member' }, 
        { label: 'Analytics' }
      ]}
    >
      {loading ? (
        renderSkeleton()
      ) : (
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
                {genreData.length > 0 ? (
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No reading data available yet
                  </div>
                )}
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
                  <h4 className="text-2xl font-bold text-primary">{readingSummary.booksThisMonth}</h4>
                  <p className="text-sm text-muted-foreground">Books This Month</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                  <h4 className="text-2xl font-bold text-primary">{readingSummary.booksThisYear}</h4>
                  <p className="text-sm text-muted-foreground">Books This Year</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                  <h4 className="text-2xl font-bold text-primary">{readingSummary.favoriteGenre}</h4>
                  <p className="text-sm text-muted-foreground">Favorite Genre</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                  <h4 className="text-2xl font-bold text-primary">{readingSummary.avgReadingTime}</h4>
                  <p className="text-sm text-muted-foreground">Avg. Reading Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analytics;
