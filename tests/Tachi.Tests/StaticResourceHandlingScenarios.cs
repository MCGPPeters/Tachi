using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Owin;
using Xunit;

namespace Tachi.Tests
{
    public class StaticResourceHandlingScenarios
    {
        private delegate IEnumerable<TResourceDescriptor> GetResourceDescriptor<out TResourceDescriptor>(
            PathString requestPath);

        private readonly Application.AppFunc _staticResourceHandler = environment => Task.FromResult(0);

        private static Func<GetResourceDescriptor<FileInfo>, Application.MidFunc> CreateStaticFileHandler =>
            getFileDescriptor =>
            {
                return next => env =>
                {
                    var owinContext = new OwinContext(env);
                    owinContext.Response.StatusCode = owinContext.Request.Method == "HEAD" ? 200 : 404;
                    owinContext.Response.Headers[HttpResponseHeader.ContentType.ToString()] = "txt/xml";
                    return Task.FromResult(0);
                };
            };

        private static Dictionary<HttpStatusCode, string> HttpReasonPhrases => new Dictionary<HttpStatusCode, string>
        {
            {HttpStatusCode.Continue, "Continue"},
            {HttpStatusCode.SwitchingProtocols, "Switching Protocols"},
            {HttpStatusCode.OK, "OK"},
            {HttpStatusCode.Created, "Created"},
            {HttpStatusCode.Accepted, "Accepted"},
            {HttpStatusCode.NonAuthoritativeInformation, "Non-Authoritative Information"},
            {HttpStatusCode.NoContent, "No Content"},
            {HttpStatusCode.ResetContent, "Reset Content"},
            {HttpStatusCode.PartialContent, "Partial Content"},
            {HttpStatusCode.MultipleChoices, "Multiple Choices"},
            {HttpStatusCode.MovedPermanently, "Moved Permanently"},
            {HttpStatusCode.Found, "Found"},
            {HttpStatusCode.SeeOther, "See Other"},
            {HttpStatusCode.NotModified, "Not Modified"},
            {HttpStatusCode.UseProxy, "Use Proxy"},
            {HttpStatusCode.TemporaryRedirect, "Temporary Redirect"},
            {HttpStatusCode.BadRequest, "Bad Request"},
            {HttpStatusCode.Unauthorized, "Unauthorized"},
            {HttpStatusCode.PaymentRequired, "Payment Required"},
            {HttpStatusCode.Forbidden, "Forbidden"},
            {HttpStatusCode.NotFound, "Not Found"},
            {HttpStatusCode.MethodNotAllowed, "Method Not Allowed"},
            {HttpStatusCode.NotAcceptable, "Not Acceptable"},
            {HttpStatusCode.ProxyAuthenticationRequired, "Proxy Authentication Required"},
            {HttpStatusCode.RequestTimeout, "Request Time-out"},
            {HttpStatusCode.Conflict, "Conflict"},
            {HttpStatusCode.Gone, "Gone"},
            {HttpStatusCode.LengthRequired, "Length Required"},
            {HttpStatusCode.PreconditionFailed, "Precondition Failed"},
            {HttpStatusCode.RequestEntityTooLarge, "Request Entity Too Large"},
            {HttpStatusCode.RequestUriTooLong, "Request-URI Too Large"},
            {HttpStatusCode.UnsupportedMediaType, "Unsupported Media Type"},
            {HttpStatusCode.RequestedRangeNotSatisfiable, "Requested range not satisfiable"},
            {HttpStatusCode.ExpectationFailed, "Expectation Failed"},
            {HttpStatusCode.InternalServerError, "Internal Server Error"},
            {HttpStatusCode.NotImplemented, "Not Implemented"},
            {HttpStatusCode.BadGateway, "Bad Gateway"},
            {HttpStatusCode.ServiceUnavailable, "Service Unavailable"},
            {HttpStatusCode.GatewayTimeout, "Gateway Time-out"},
            {HttpStatusCode.HttpVersionNotSupported, "HTTP Version not supported"}
        };


        [Fact]
        public async Task Given_a_file_does_not_exists_returns_not_found()
        {
            GetResourceDescriptor<FileInfo> getFileDescriptorStub = pathString => Enumerable.Empty<FileInfo>();
            var staticFileHandler = CreateStaticFileHandler(getFileDescriptorStub);
            Func<IDictionary<string, object>, Task> appFunc = staticFileHandler.Invoke(Application.NotFound).Invoke;
            var httpMessageHandler = new OwinHttpMessageHandler(appFunc);
            var client = new HttpClient(httpMessageHandler);

            var result = await client.GetAsync(new Uri("http://any/path"));

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
            result.ReasonPhrase.Should().Be(HttpReasonPhrases[HttpStatusCode.NotFound]);
        }

        [Fact]
        public async Task When_a_HEAD_method_is_used_the_response_should_not_contain_a_body()
        {
            GetResourceDescriptor<FileInfo> getFileDescriptorStub =
                pathString => Enumerable.Repeat(new FileInfo("foo.xml"), 1);
            var staticFileHandler = CreateStaticFileHandler(getFileDescriptorStub);
            Func<IDictionary<string, object>, Task> appFunc = staticFileHandler.Invoke(Application.NotFound).Invoke;
            var httpMessageHandler = new OwinHttpMessageHandler(appFunc);
            var client = new HttpClient(httpMessageHandler);
            var requestUri = new Uri("http://any/path");
            var request = new HttpRequestMessage(HttpMethod.Head, requestUri);

            var result = await client.SendAsync(request);

            result.StatusCode.Should().Be(HttpStatusCode.OK);
            result.Content.Headers.ContentType.ToString().Should().Be("text/xml");
            result.Content.Headers.ContentLength.Should().BeGreaterThan(0);
            var length = (await result.Content.ReadAsByteArrayAsync()).Length;
            length.Should().Be(0);
        }
    }
}