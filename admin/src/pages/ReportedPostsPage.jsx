import { useEffect, useState } from 'react';
import { Image, Box, Button, Spinner } from '@chakra-ui/react';

import useShowToast from '../hooks/useShowToast';

const ReportedPostsPage = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(false); // New loading state
  const [error, setError] = useState(null);
  const showToast = useShowToast();

  const fetchReportedPosts = async () => {
    setLoading(true); // Start loading
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch reported posts');
      }

      const data = await res.json();
      setReportedPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const handleDeletePost = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to delete this post?')) return;

      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      showToast('Success', 'Post deleted', 'success');
      fetchReportedPosts();
    } catch (error) {
      showToast('Error', error.message, 'error');
    }
  };

  return (
    <div>
      <h1
        style={{
          marginBottom: '20px',
          fontWeight: 900,
          color: 'purple',
          fontSize: 30,
        }}
      >
        Reported Posts
      </h1>
      {loading ? (
        <Spinner size='xl' color='purple.500' />
      ) : error ? (
        <p style={{ color: 'red' }}>No posts found</p>
      ) : (
        <>
          {reportedPosts.map((post) => (
            <Box
              key={post._id}
              borderRadius={6}
              overflow='hidden'
              borderColor='gray.light'
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '10px',
                padding: '30px',
                backgroundColor: '#f0f0f0',
                marginBottom: '10px',
              }}
            >
              <div>
                <h3 style={{ fontWeight: 900, marginBottom: '10px' }}>
                  Title: {post.text}
                </h3>
                {post.img && (
                  <Image
                    src={post.img}
                    width={500}
                    height={500}
                    style={{ borderRadius: '4px' }}
                  />
                )}
              </div>

              <div style={{ marginLeft: 'auto' }}>
                <h3 style={{ fontWeight: 900 }}>
                  Number of reports: {post.reports}
                </h3>
                <Button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f00',
                    color: '#fff',
                    marginTop: 50,
                  }}
                  onClick={() => handleDeletePost(post._id)}
                >
                  Delete Post
                </Button>
              </div>
            </Box>
          ))}
        </>
      )}
    </div>
  );
};

export default ReportedPostsPage;
