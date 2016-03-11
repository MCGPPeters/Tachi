namespace eVision.InteractivePnid.Tests.Fixtures
{
    public class TestablePnidApplication : TestableOwinEdgeApplication
    {
        public TestablePnidApplication()
        {
            var task = InteractivePnidApplicationFixture.Create(new TestDataBuilder());
            AppFunc = task.Result.AppFunc;
        }
    }
}